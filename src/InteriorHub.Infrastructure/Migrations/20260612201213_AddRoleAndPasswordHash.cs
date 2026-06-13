using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteriorHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleAndPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Engineers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Engineers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Engineer");

            migrationBuilder.AddColumn<string>(
                name: "Specialization",
                table: "Engineers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Engineers");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Engineers");

            migrationBuilder.DropColumn(
                name: "Specialization",
                table: "Engineers");
        }
    }
}
