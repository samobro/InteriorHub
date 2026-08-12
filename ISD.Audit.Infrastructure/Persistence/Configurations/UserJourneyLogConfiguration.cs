using ISD.Audit.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ISD.Audit.Infrastructure.Persistence.Configurations
{
    public class UserJourneyLogConfiguration : IEntityTypeConfiguration<UserJourneyLog>

    {

        public void Configure(EntityTypeBuilder<UserJourneyLog> builder)

        {

            builder.ToTable("UserJourneyLogs", schema: "audit", tb =>

            tb.HasCheckConstraint("CK_UserJourneyLogs_Status", "Status IN ('Success', 'Failed')"));
            builder.HasKey(x => x.LogId);

            builder.Property(x => x.LogId)

                .ValueGeneratedOnAdd();

            builder.Property(x => x.SessionId)

                .IsRequired();

            builder.Property(x => x.UserId)

                .HasMaxLength(50);

            builder.Property(x => x.ProcessName)

                .HasMaxLength(100)

                .IsRequired();

            builder.Property(x => x.StepName)

                .HasMaxLength(100)

                .IsRequired();

            builder.Property(x => x.Status)
               .HasConversion<string>()
               .HasMaxLength(20)
               .IsRequired();

            builder.Property(x => x.FailureReason)

                .HasMaxLength(250);

            builder.Property(x => x.MetadataJson)

                .HasColumnType("nvarchar(max)");

            builder.Property(x => x.CreatedAt)

                .HasDefaultValueSql("GETUTCDATE()");

            // مهم جداً للأداء - هذا الجدول بيكبر بسرعة وبيتقرا كثير بالداشبورد

            builder.HasIndex(x => x.SessionId)

                .HasDatabaseName("IX_UserJourneyLogs_SessionId");

            builder.HasIndex(x => new { x.ProcessName, x.CreatedAt })

                .HasDatabaseName("IX_UserJourneyLogs_ProcessName_CreatedAt");

        }

    }
}
