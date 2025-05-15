using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace ReactApp1.Server.Hubs
{
    public class EventHub : Hub
    {
        public async Task SendUpdate(string eventId, string message)
        {
            await Clients.Group(eventId).SendAsync("ReceiveUpdate", message);
        }

        public async Task JoinEventGroup(string eventId)
        {
            if (string.IsNullOrEmpty(eventId))
                throw new ArgumentNullException(nameof(eventId));

            await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
        }

        public async Task LeaveEventGroup(string eventId)
        {
            if (string.IsNullOrEmpty(eventId))
                return; // Gracefully handle empty eventId

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, eventId);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Optional: Handle any cleanup when client disconnects unexpectedly
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendTextMessage(string eventId, string textMessage)
        {
            if (string.IsNullOrEmpty(eventId)) throw new ArgumentNullException(nameof(eventId));
            if (string.IsNullOrEmpty(textMessage)) throw new ArgumentNullException(nameof(textMessage));

            await Clients.Group(eventId).SendAsync("ReceiveUpdate", textMessage);
        }

    }

}

