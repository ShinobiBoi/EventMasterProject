using ReactApp1.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class User
{
    public Guid UserId { get; set; }

    [Required(ErrorMessage = "Name Required")]
    [MaxLength(100, ErrorMessage = "Full name must not exceed 100 characters")]
    public string FullName { get; set; }

    [Required(ErrorMessage = "Email Required")]
    [EmailAddress(ErrorMessage = "Email is incorrect")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password Required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string PasswordHash { get; set; }

    [Required(ErrorMessage = "Role is Required")]
    public string Role { get; set; }

    public bool IsApproved { get; set; } = true;

    public string RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    [JsonIgnore]
    public List<Ticket> tickets { get; set; } = new List<Ticket>();
}