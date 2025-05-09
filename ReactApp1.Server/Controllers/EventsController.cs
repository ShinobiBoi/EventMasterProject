using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // Get all events
        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            var events = await _context.Events.ToListAsync();

            foreach (var e in events)
            {
                if (!string.IsNullOrEmpty(e.Venue))
                {
                    e.Venue = DesEncryptionHelper.Decrypt(e.Venue);
                }
            }

            return Ok(events);
        }


        [Authorize(Roles = "Admin,Organizer")]
        [HttpGet("user/{id}")]
public async Task<IActionResult> GetEventsById(string id, [FromQuery] string role) // Add the id parameter
        {
            // Filter events by userId
            List<Event> events;


            if (role.Equals("Organizer")){
                events = await _context.Events
                    .Where(e => e.userId.Equals(id))
                    .ToListAsync();
            }
            else
            {
               events = await _context.Events.ToListAsync();

            }

                foreach (var e in events)
                {
                    if (!string.IsNullOrEmpty(e.Venue))
                    {
                        e.Venue = DesEncryptionHelper.Decrypt(e.Venue);
                    }
                }
            
            return Ok(events);
        }

        // Get single event
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(eventItem.Venue))
            {
                eventItem.Venue = DesEncryptionHelper.Decrypt(eventItem.Venue);
            }

            return Ok(eventItem);
        }

        // Add new event
        [Authorize(Roles = "Admin,Organizer")]
        [HttpPost]
        public async Task<IActionResult> AddEvent( Event eventItem)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var newEvent = new Event
                {
                    OrganizerName = eventItem.OrganizerName,
                    Title = eventItem.Title,
                    Description = eventItem.Description,
                    Venue = DesEncryptionHelper.Encrypt(eventItem.Venue),
                    EventDate = eventItem.EventDate,
                    TicketPrice = eventItem.TicketPrice,
                    TicketsLeft = eventItem.TicketsLeft,
                    ParticipantsSubmitted = eventItem.ParticipantsSubmitted,
                    Submitted = eventItem.Submitted,
                    userId = eventItem.userId
                };

                _context.Events.Add(newEvent);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetEvent),
                    new { id = newEvent.Eventid },
                    new
                    {
                        Eventid = newEvent.Eventid,
                        OrganizerName = newEvent.OrganizerName,
                        Title = newEvent.Title
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Organizer")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] Event eventItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEvent = await _context.Events.FindAsync(id);
            if (existingEvent == null)
            {
                return NotFound("Event not found");
            }

            // Update only the allowed fields
            existingEvent.Title = eventItem.Title;
            existingEvent.Description = eventItem.Description;
            existingEvent.Venue = DesEncryptionHelper.Encrypt(eventItem.Venue);
            existingEvent.EventDate = eventItem.EventDate;
            existingEvent.TicketPrice = eventItem.TicketPrice;
            existingEvent.TicketsLeft = eventItem.TicketsLeft;
            existingEvent.ParticipantsSubmitted = eventItem.ParticipantsSubmitted;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(existingEvent);
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Concurrency error occurred");
            }
        }


        [HttpPatch("register/{id}")]
        [Authorize(Roles = "Admin,Organizer,Attendee")] // Allow users to register for events
        public async Task<IActionResult> RegisterForEvent(int id)
        {
            var existingEvent = await _context.Events.FindAsync(id);
            if (existingEvent == null)
            {
                return NotFound("Event not found");
            }

            // Check if there are tickets available
            if (existingEvent.TicketsLeft <= 0)
            {
                return BadRequest("No tickets available for this event");
            }

            // Update the counts
            existingEvent.ParticipantsSubmitted++;
            existingEvent.TicketsLeft--;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    Message = "Successfully registered for event",
                    Participants = existingEvent.ParticipantsSubmitted,
                    TicketsLeft = existingEvent.TicketsLeft
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Concurrency error occurred while updating event");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Delete event
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Organizer")]
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
