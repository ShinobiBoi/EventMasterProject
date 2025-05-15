using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ReactApp1.Server.Hubs
{
    public class EventHub : Hub
    {
        /*// Method for clients to join a specific event group
        public async Task JoinEventGroup(string eventId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
            await Clients.Group(eventId).SendAsync("UserJoined", Context.ConnectionId);
        }

        // Method to notify participants about new attachments
        public async Task NotifyNewAttachment(string eventId, string fileName)
        {
            await Clients.Group(eventId).SendAsync("NewAttachment", fileName);
        }

        // Method to notify participants about event updates
        public async Task NotifyEventUpdate(string eventId, string updateMessage)
        {
            await Clients.Group(eventId).SendAsync("EventUpdate", updateMessage);
        }

        // Method to leave the group
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }*/
    }
}