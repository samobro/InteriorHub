using ISD.Audit.Domain.Models;
using ISD.Audit.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace ISD.Audit.Infrastructure.Persistence.Configurations;

public class ProcessDefinitionConfiguration : IEntityTypeConfiguration<ProcessDefinition>
{ 
    public void Configure(EntityTypeBuilder<ProcessDefinition> builder) 
    { 
        builder.ToTable("ProcessDefinition", schema: Schema.Audit);
        
        builder.HasKey(x => x.ProcessId);
        
        builder.Property(x => x.ProcessId).ValueGeneratedOnAdd();

        builder.Property(x => x.ProcessName).HasMaxLength(100).IsRequired();

        builder.Property(x => x.StepName).HasMaxLength(100).IsRequired();

        builder.Property(x => x.StepOrder).IsRequired();

        builder.Property(x => x.IsFinalStep).HasDefaultValue(false); 
        
        builder.Property(x => x.Description).HasMaxLength(250);
        
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        
        builder.HasIndex(x => 
        
        new { x.ProcessName, x.StepOrder }).IsUnique().HasDatabaseName("UQ_Process_StepOrder");
        
        builder.HasIndex(x =>
        
        new { x.ProcessName, x.StepName }).IsUnique().HasDatabaseName("UQ_Process_StepName"); 
        
        builder.HasData(
            
            new { ProcessId = 1, ProcessName = "Registration", StepName = "SendRegistrationOTPAsync", StepOrder = 1, IsFinalStep = false, CreatedAt = new DateTime(2026, 8, 15) },
            
            new { ProcessId = 2, ProcessName = "Registration", StepName = "RegisterAnonymousAsync", StepOrder = 2, IsFinalStep = false, CreatedAt = new DateTime(2026, 8, 15) }, 
            
            new { ProcessId = 3, ProcessName = "Registration", StepName = "AddAddressInfoAsync", StepOrder = 3, IsFinalStep = false, CreatedAt = new DateTime(2026, 8, 15) },
            
            new { ProcessId = 4, ProcessName = "Registration", StepName = "AddPersonalDataAsync", StepOrder = 4, IsFinalStep = false, CreatedAt = new DateTime(2026, 8, 15) }, 
            
            new { ProcessId = 5, ProcessName = "Registration", StepName = "UpdatePersonalDocAsync", StepOrder = 5, IsFinalStep = false, CreatedAt = new DateTime(2026, 8, 15) },
            
            new { ProcessId = 6, ProcessName = "Registration", StepName = "AddSelfie", StepOrder = 6, IsFinalStep = true, CreatedAt = new DateTime(2026, 8, 15) }); } 
}