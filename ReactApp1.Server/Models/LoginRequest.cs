using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class LoginRequest
    {
       
        
            [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
            [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
            public string Email { get; set; }

            [Required(ErrorMessage = "كلمة المرور مطلوبة")]
            [MinLength(6, ErrorMessage = "كلمة المرور يجب أن تكون على الأقل 6 أحرف")]
            public string Password { get; set; }
        


    }
}
