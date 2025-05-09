using ReactApp1.Server.Models;

public class SavedEvent
{
    public Guid SavedEventId { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; }

    public int EventId { get; set; }
    public Event Event { get; set; }

    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
