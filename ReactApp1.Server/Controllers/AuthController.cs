using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IaDatabaseContext _context;
        private readonly IConfiguration _config;

        public AuthController(IaDatabaseContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                    return BadRequest("Email already exists");

                if (user.Role == "Attendee")
                {
                    user.IsApproved = true;
                }
                else if (user.Role == "Organizer")
                {
                    user.IsApproved = true;
                }
                else
                {
                    return Unauthorized("Only Attendee or Organizer registration is allowed");
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                return Ok("Registration successful. Please wait for admin approval if you registered as Organizer.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while registering the user: {ex.Message}");
            }
        }

        [HttpPost("create-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser(User user)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                    return BadRequest("Email already exists");

                if (user.Role != "Organizer" && user.Role != "Admin")
                    return BadRequest("Only Organizer or Admin can be created");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                return Ok("User created successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                    return Unauthorized("Invalid credentials");

                if (!user.IsApproved && user.Role == "Organizer")
                    return Unauthorized("Your account is pending admin approval.");

                var accessToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    accessToken,
                    refreshToken,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while logging in: {ex.Message}");
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest("Invalid client request");

            var principal = GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
                return BadRequest("Invalid access token or refresh token");

            var userEmail = principal.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

            if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return Unauthorized();

            var newJwtToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(6);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                accessToken = newJwtToken,
                refreshToken = newRefreshToken
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                    return BadRequest("User not found");

                if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
                    return Unauthorized("Old password is incorrect");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok("Password changed successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpDelete("delete-user/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound("User not found");

                var currentAdminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                if (user.UserId == currentAdminId)
                    return BadRequest("You cannot delete your own account.");

                if (user.Role == "Admin")
                {
                    var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                    if (adminCount <= 1)
                        return BadRequest("Cannot delete the last admin.");
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok("User deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("approve-organizer/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOrganizer(Guid id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Organizer");
                if (user == null)
                    return NotFound("Organizer not found");

                if (user.IsApproved)
                    return BadRequest("Organizer is already approved");

                user.IsApproved = true;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok("Organizer approved successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while approving the organizer: {ex.Message}");
            }
        }


        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized("Invalid token");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

                if (user == null)
                    return NotFound("User not found");

                
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok("Logged out successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while logging out: {ex.Message}");
            }
        }


        #region Helper Methods

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }

        #endregion
    }
}