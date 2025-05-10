using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models;

public partial class Ticket
{

    [Key]
    public int TicketId { get; set; }


    [ForeignKey(nameof(Participant))]
    public Guid ParticipantId { get; set; }

    [ForeignKey(nameof(Event))]
    public int EventId { get; set; }

    public int numberOfTickets { get; set; }

    public int totalPrice { get; set; }


    public Event Event { get; set; }

    public User Participant { get; set; }
}