using ISD.Audit.Domain.Models;
using ISD.Audit.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ISD.Audit.Infrastructure
{
    public class AuditDbContext : DbContext

    {

        public AuditDbContext(DbContextOptions<AuditDbContext> options) : base(options) { }

        public DbSet<ProcessDefinition> ProcessDefinitions { get; set; }

        public DbSet<UserJourneyLog> UserJourneyLogs { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

        {

            base.OnConfiguring(optionsBuilder);

        }

        protected override void OnModelCreating(ModelBuilder builder)

        {

            builder.HasDefaultSchema(Schema.Audit);

            builder.ApplyConfigurationsFromAssembly(typeof(AuditDbContext).Assembly);

            base.OnModelCreating(builder);

        }

    }
}
