using Microsoft.EntityFrameworkCore;


namespace ReactApp1.Server.Models;

public static class DbSeeder
{
    public static void SeedAdmin(IaDatabaseContext context)
    {

        context.Database.Migrate();


        if (!context.Users.Any(u => u.Role == "Admin"))
        {
            var admin = new User
            {
                FullName = "Super Admin",
                Email = "admin@eventmaster.com",
                Role = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                RefreshToken = string.Empty,
            };

            context.Users.Add(admin);
            context.SaveChanges();
        }
    }
}