using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavedEventsController : ControllerBase
    {
        private readonly IaDatabaseContext _context;

        public SavedEventsController(IaDatabaseContext context)
        {
            _context = context;
        }

        // Save an event
        [Authorize(Roles = "Attendee,Organizer,Admin")]
        [HttpPost("{userId}/{eventId}")]
        public async Task<IActionResult> SaveEvent(Guid userId, int eventId)
        {
            var exists = await _context.SavedEvents
                .AnyAsync(se => se.UserId == userId && se.EventId == eventId);

            if (exists)
                return BadRequest("Event already saved");

            var savedEvent = new SavedEvent
            {
                UserId = userId,
                EventId = eventId
            };

            await _context.SavedEvents.AddAsync(savedEvent);
            await _context.SaveChangesAsync();

            return Ok("Event saved");
        }

        // Get saved events for user
        [Authorize]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSavedEvents(Guid userId)
        {
            var savedEvents = await _context.SavedEvents
                .Include(se => se.Event) // تحميل بيانات الحدث المرتبط
                .Where(se => se.UserId == userId)
               
                .ToListAsync();

            if (!savedEvents.Any())
            {
                return NotFound("No saved events found for this user.");
            }

            return Ok(savedEvents);
        }

        // Unsave an event
        [Authorize]
        [HttpDelete("{userId}/{eventId}")]
        public async Task<IActionResult> UnsaveEvent(Guid userId, int eventId)
        {
            var savedEvent = await _context.SavedEvents
                .FirstOrDefaultAsync(se => se.UserId == userId && se.EventId == eventId);

            if (savedEvent == null)
                return NotFound("Event not saved");

            _context.SavedEvents.Remove(savedEvent);
            await _context.SaveChangesAsync();

            return Ok("Event unsaved");
        }
    }
}
