using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.Models;

public partial class Event
{
    [Key]
    public int Eventid { get; set; }

    public string OrganizerName { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; }

    public string Venue { get; set; }

    public DateTime EventDate { get; set; }

    public decimal TicketPrice { get; set; }

    public int TicketsLeft { get; set; }

    public int ParticipantsSubmitted { get; set; } = 0;

    public bool Submitted { get; set; } = false;

    [JsonIgnore]
    public List<Ticket> Tickets { get; set; } = new List<Ticket>();
}