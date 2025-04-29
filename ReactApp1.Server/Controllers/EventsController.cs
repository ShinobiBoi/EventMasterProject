using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IaDatabaseContext _context;

        public EventsController(IaDatabaseContext context)
        {
            _context = context;
        }

        // Get all events (open to everyone)
        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            var events = await _context.Events.ToListAsync();
            return Ok(events);
        }

        // Get single event (open to everyone)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound();
            }

            return Ok(eventItem);
        }

        // Add new event (Admin, Organizer only)

        //[Authorize(Roles = "Admin,Organizer")]
        [HttpPost]
        public async Task<IActionResult> AddEvent([FromBody] Event eventItem)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Ensure required fields are mapped correctly
                var newEvent = new Event
                {
                    OrganizerName = eventItem.OrganizerName,
                    Title = eventItem.Title,
                    Description = eventItem.Description,
                    Venue = eventItem.Venue,
                    EventDate = eventItem.EventDate,
                    TicketPrice = eventItem.TicketPrice,
                    TicketsLeft = eventItem.TicketsLeft,
                    ParticipantsSubmitted = eventItem.ParticipantsSubmitted,
                    Submitted = eventItem.Submitted
                };

                _context.Events.Add(newEvent);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetEvent),
                    new { id = newEvent.Eventid },
                    new
                    {
                        Eventid = newEvent.Eventid,
                        OrganizerName = newEvent.OrganizerName,
                        Title = newEvent.Title,
                        // Include other properties you want to return
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Update event (Admin, Organizer only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Organizer")]
        public async Task<IActionResult> UpdateEvent(Event eventItem)
        {
            var e = await _context.Events.FindAsync(eventItem.Eventid);

            if (e == null)
            {
                return NotFound("Event not found");
            }

            e.Title = eventItem.Title;
            e.Description = eventItem.Description;
            e.Venue = eventItem.Venue;
            e.EventDate = eventItem.EventDate;
            e.TicketPrice = eventItem.TicketPrice;
            e.TicketsLeft = eventItem.TicketsLeft;

            await _context.SaveChangesAsync();
            return Ok();
        }

        // Delete event (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound();
            }

            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
