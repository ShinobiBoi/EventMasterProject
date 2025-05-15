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


            if (role.Equals("Organizer"))
            {
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
        public async Task<IActionResult> AddEvent(Event eventItem)
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
            existingEvent.Venue = eventItem.Venue;
            existingEvent.EventDate = eventItem.EventDate;
            existingEvent.TicketPrice = eventItem.TicketPrice;
            existingEvent.TicketsLeft = eventItem.TicketsLeft;
            existingEvent.ParticipantsSubmitted = eventItem.ParticipantsSubmitted;

            try
            {
                await _context.SaveChangesAsync();

                //  Send toast notification to all clients in the event group
                await _hubContext.Clients.Group(id.ToString())
                    .SendAsync("ReceiveUpdate", $"Event '{existingEvent.Title}' was updated!");

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

        [Authorize(Roles = "Admin,Organizer")]
        [HttpPost("upload/{eventId}")]
        public async Task<IActionResult> UploadFile(int eventId, IFormFile file)

        {

            Console.WriteLine("44444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444");

            try
            {
                Console.WriteLine($"Starting upload for event {eventId}");

                var eventItem = await _context.Events.FindAsync(eventId);
                if (eventItem == null)
                {
                    Console.WriteLine("Event not found");
                    return NotFound("Event not found");
                }

                if (file == null || file.Length == 0)
                {
                    Console.WriteLine("Invalid file");
                    return BadRequest("Invalid file");
                }

                Console.WriteLine($"Received file: {file.FileName}, Size: {file.Length} bytes");

                var safeFileName = Path.GetFileName(file.FileName);
                Console.WriteLine($"Safe filename: {safeFileName}");

                var uploadsPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", eventId.ToString());
                Console.WriteLine($"Upload path: {uploadsPath}");

                // Ensure directory exists
                try
                {
                    Directory.CreateDirectory(uploadsPath);
                    Console.WriteLine("Directory created successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Directory creation failed: {ex}");
                    return StatusCode(500, "Could not create upload directory");
                }

                var filePath = Path.Combine(uploadsPath, safeFileName);
                Console.WriteLine($"Final file path: {filePath}");

                try
                {
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    Console.WriteLine("File saved successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"File save failed: {ex}");
                    return StatusCode(500, "File save failed");
                }

                try
                {
                    await _hubContext.Clients.Group(eventId.ToString())
                        .SendAsync("ReceiveUpdate", $"{safeFileName} uploaded.");
                    Console.WriteLine("SignalR notification sent");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SignalR failed: {ex}");
                    // Don't fail the upload if SignalR fails
                }

                return Ok(new { message = "File uploaded", filename = safeFileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upload failed with exception: {ex}");
                return StatusCode(500, $"Upload failed: {ex.Message}");
            }
        }


        [HttpGet("download/{eventId}/{filename}")]
        [Authorize(Roles = "Admin,Organizer,Attendee")]
        public IActionResult DownloadFile(int eventId, string filename)
        {
            var path = Path.Combine(_environment.WebRootPath, "uploads", eventId.ToString(), filename);
            if (!System.IO.File.Exists(path)) return NotFound();

            var bytes = System.IO.File.ReadAllBytes(path);
            return File(bytes, "application/octet-stream", filename);
        }


    }

}