using Microsoft.AspNetCore.SignalR;

namespace ReactApp1.Server.Hubs
{
    public class EventHub : Hub
    {
        // Method for clients to join a specific event group
        public async Task JoinEventGroup(string eventId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
            await Clients.Group(eventId).SendAsync("UserJoined", Context.ConnectionId);
        }

        // Method to leave the group
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}