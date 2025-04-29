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




        [HttpGet("{id}")]
        public async Task<IActionResult> GetMyTickets(Guid id)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Event)
                .Include(t => t.Participant)
                .Where(t => t.ParticipantId == id)
                .ToListAsync();

            if (!tickets.Any())
            {
                return NotFound("No events found on the specified date");
            }

            return Ok(tickets);
        }

        
        [HttpPost("{userId}/{eventId}")]
        public async Task<IActionResult> buyTicket(Guid userId,int eventId)
        {
            await _context.Tickets.AddAsync(new Ticket {
                ParticipantId =userId,
                EventId =eventId
            }); 

                _context.SaveChanges();


            return Ok();
        }

    }
}
