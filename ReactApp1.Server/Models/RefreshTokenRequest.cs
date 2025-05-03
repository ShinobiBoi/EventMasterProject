using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class RefreshTokenRequest
    {
        [Required]
        public string AccessToken { get; set; }

        [Required]
        public string RefreshToken { get; set; }
    }
}