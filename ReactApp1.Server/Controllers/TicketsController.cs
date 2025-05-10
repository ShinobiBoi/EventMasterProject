using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly IaDatabaseContext _context;

        public TicketsController(IaDatabaseContext context)
        {
            _context = context;
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetMyTickets(Guid id)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Event)
                .Include(t => t.Participant)
                .Where(t => t.ParticipantId == id)
                .Select(t => new {
                    TicketId = t.TicketId,
                    EventId = t.EventId,
                    EventTitle = t.Event.Title,
                    EventDescription = t.Event.Description,
                    EventDate = t.Event.EventDate,
                    EventVenue = t.Event.Venue,
                    Quantity = t.numberOfTickets,
                    totalPrice = t.totalPrice
                })
                .ToListAsync();

            if (!tickets.Any())
            {
                return NotFound("No tickets found for this user");
            }

            return Ok(tickets);
        }

        [HttpPost("{userId}/{eventId}")]
        public async Task<IActionResult> BuyTicket(Guid userId, int eventId, [FromBody] TicketRequest request)
        {
  
            // Create new ticket
            var ticket = new Ticket
            {
                ParticipantId = userId,
                EventId = eventId,
                numberOfTickets = request.NumberOfTickets,
                totalPrice = request.TotalPrice
            };

            await _context.Tickets.AddAsync(ticket);


            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tickets purchased successfully",
                TicketId = ticket.TicketId
            });
        }
    }

    public class TicketRequest
    {
        public int NumberOfTickets { get; set; }
        public int TotalPrice { get; set; }
    }
}