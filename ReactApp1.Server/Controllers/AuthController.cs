using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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
                    user.IsApproved = false;
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
                if (user == null)
                    return Unauthorized("Invalid credentials");

                var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                if (!isPasswordValid)
                    return Unauthorized("Invalid credentials");

                if (!user.IsApproved && user.Role == "Organizer")
                    return Unauthorized("Your account is pending admin approval.");

                var token = GenerateJwtToken(user);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while logging in: {ex.Message}");
            }
        }



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
                expires: DateTime.UtcNow.AddHours(3),
                // expires: DateTime.UtcNow.AddMinutes(5),قالوا خلوه وقت قليل
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
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

    }
}