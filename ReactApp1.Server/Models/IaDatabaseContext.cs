using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ReactApp1.Server.Models;

public  class IaDatabaseContext : DbContext
{
    public IaDatabaseContext()
    {
    }

    public IaDatabaseContext(DbContextOptions<IaDatabaseContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<User> Users { get; set; }


}
