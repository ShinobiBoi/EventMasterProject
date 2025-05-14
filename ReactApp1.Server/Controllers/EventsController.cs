using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using ReactApp1.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;

namespace ReactApp1.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IaDatabaseContext _context;
        private readonly IHubContext<EventHub> _hubContext;
        private readonly IWebHostEnvironment _environment;

        public EventsController(IaDatabaseContext context, IHubContext<EventHub> hubContext, IWebHostEnvironment environment)
        {
            _context = context;
            _hubContext = hubContext;
            _environment = environment;
        }

        // Get all events
        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            var events = await _context.Events.
                Where(e => e.Submitted == true).ToListAsync();

            return Ok(events);
        }


        // Get all unsubmitted events (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpGet("unsubmitted")]
        public async Task<IActionResult> GetUnsubmittedEvents()
        {
            var events = await _context.Events
                .Where(e => e.Submitted == false)
                .ToListAsync();

            return Ok(events);
        }

        // Approve an event (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPatch("approve/{id}")]
        public async Task<IActionResult> ApproveEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound("Event not found");
            }

            // Approve the event by setting Submitted to true
            eventItem.Submitted = true;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    Message = "Event approved successfully",
                    EventId = eventItem.Eventid,
                    Title = eventItem.Title,
                    Submitted = eventItem.Submitted
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Concurrency error occurred while approving event");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
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
                    Venue = eventItem.Venue,
                    EventDate = eventItem.EventDate,
                    TicketPrice = eventItem.TicketPrice,
                    TicketsLeft = eventItem.TicketsLeft,
                    ParticipantsSubmitted = eventItem.ParticipantsSubmitted,
                    Submitted = eventItem.Submitted,
                    userId = eventItem.userId,
                    AttachmentUrl = eventItem.AttachmentUrl
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
            existingEvent.Venue = eventItem.Venue;
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

        // Upload attachment for an event
        [Authorize(Roles = "Admin,Organizer")]
        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadAttachment(int id, IFormFile file)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound("Event not found");
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", id.ToString());
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update event with attachment URL
            eventItem.AttachmentUrl = $"/uploads/{id}/{fileName}";
            await _context.SaveChangesAsync();

            // Notify participants about new attachment
            await _hubContext.Clients.Group(id.ToString()).SendAsync("NewAttachment", file.FileName);

            return Ok(new { fileName = file.FileName, url = eventItem.AttachmentUrl });
        }

        // Send update to event participants
        [Authorize(Roles = "Admin,Organizer")]
        [HttpPost("{id}/update")]
        public async Task<IActionResult> SendEventUpdate(int id, [FromBody] EventUpdate update)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound("Event not found");
            }

            // Notify participants about the update
            await _hubContext.Clients.Group(id.ToString()).SendAsync("EventUpdate", update.Message);

            return Ok(new { message = "Update sent successfully" });
        }

        // Get event attachments
        [HttpGet("{id}/attachments")]
        public async Task<IActionResult> GetEventAttachments(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound("Event not found");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", id.ToString());
            if (!Directory.Exists(uploadsFolder))
            {
                return Ok(new List<string>());
            }

            var files = Directory.GetFiles(uploadsFolder)
                .Select(f => new
                {
                    fileName = Path.GetFileName(f),
                    url = $"/uploads/{id}/{Path.GetFileName(f)}"
                })
                .ToList();

            return Ok(files);
        }
    }

    public class EventUpdate
    {
        public string Message { get; set; }
    }
}
