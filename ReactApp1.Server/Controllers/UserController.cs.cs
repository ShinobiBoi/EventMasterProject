using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IaDatabaseContext _context;

        public UserController(IaDatabaseContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Email already exists");

            if (user.Role == "Attendee" || user.Role == "Organizer")
                user.IsApproved = true;
            else
                return Unauthorized("Only Attendee or Organizer registration is allowed");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return Ok("Registration successful.");
        }

        [HttpPost("create-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser(User user)
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

        [HttpDelete("delete-user/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
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

        [HttpPost("approve-organizer/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOrganizer(Guid id)
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
    }
}
