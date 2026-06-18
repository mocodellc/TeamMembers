using backend.Contracts;
using backend.Controllers;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace backend.Tests.Controllers;

public sealed class TeamMembersControllerTests
{
    private static TeamMemberResponseDto MakeMemberDto(int id = 1) =>
        new(id, "Alice", "Smith", "alice@example.com", "Engineer", "Backend", "UK",
            DateTimeOffset.UtcNow, null, null, []);

    [Fact]
    public async Task GetMembers_ReturnsOk_WithMembers()
    {
        var members = new List<TeamMemberResponseDto> { MakeMemberDto() };
        var service = new Mock<ITeamMemberService>();
        service.Setup(s => s.GetMembersAsync(false, It.IsAny<CancellationToken>())).ReturnsAsync(members);

        var controller = new TeamMembersController(service.Object);

        var result = await controller.GetMembers(false, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, ok.StatusCode);
        Assert.Equal(members, ok.Value);
    }

    [Fact]
    public async Task GetMemberById_ReturnsOk_WhenFound()
    {
        var dto = MakeMemberDto();
        var service = new Mock<ITeamMemberService>();
        service.Setup(s => s.GetMemberByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(dto);

        var controller = new TeamMembersController(service.Object);

        var result = await controller.GetMemberById(1, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(dto, ok.Value);
    }

    [Fact]
    public async Task GetMemberById_ReturnsNotFound_WhenNotFound()
    {
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.GetMemberByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TeamMemberResponseDto?)null);

        var controller = new TeamMembersController(service.Object);

        var result = await controller.GetMemberById(99, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task CreateMember_ReturnsCreated_WhenSucceeds()
    {
        var dto = MakeMemberDto();
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.CreateMemberAsync(It.IsAny<TeamMemberUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(dto);

        var controller = new TeamMembersController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var request = new TeamMemberUpsertRequestDto
        {
            FirstName = "Alice",
            LastName = "Smith",
            Email = "alice@example.com",
            JobTitle = "Engineer",
            Department = "Backend",
            Country = "UK"
        };

        var result = await controller.CreateMember(request, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(StatusCodes.Status201Created, created.StatusCode);
        Assert.Equal(dto, created.Value);
    }

    [Fact]
    public async Task CreateMember_ReturnsBadRequest_WhenValidationFails()
    {
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.CreateMemberAsync(It.IsAny<TeamMemberUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ServiceValidationException("FirstName and LastName are required."));

        var controller = new TeamMembersController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.CreateMember(new TeamMemberUpsertRequestDto(), CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateMember_ReturnsConflict_WhenEmailIsDuplicate()
    {
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.CreateMemberAsync(It.IsAny<TeamMemberUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ServiceConflictException("A team member with this Email already exists."));

        var controller = new TeamMembersController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.CreateMember(
            new TeamMemberUpsertRequestDto { Email = "dup@example.com" },
            CancellationToken.None);

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task UpdateMember_ReturnsOk_WhenFound()
    {
        var dto = MakeMemberDto();
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.UpdateMemberAsync(1, It.IsAny<TeamMemberUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(dto);

        var controller = new TeamMembersController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.UpdateMember(
            1,
            new TeamMemberUpsertRequestDto { FirstName = "Alice", LastName = "Smith", Email = "alice@example.com", JobTitle = "Eng", Department = "BE", Country = "UK" },
            CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(dto, ok.Value);
    }

    [Fact]
    public async Task UpdateMember_ReturnsNotFound_WhenServiceReturnsNull()
    {
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.UpdateMemberAsync(99, It.IsAny<TeamMemberUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TeamMemberResponseDto?)null);

        var controller = new TeamMembersController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.UpdateMember(
            99,
            new TeamMemberUpsertRequestDto { FirstName = "X", LastName = "Y", Email = "x@y.com", JobTitle = "X", Department = "X", Country = "X" },
            CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteMember_ReturnsOk_WhenFound()
    {
        var dto = MakeMemberDto();
        var service = new Mock<ITeamMemberService>();
        service.Setup(s => s.SoftDeleteMemberAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(dto);

        var controller = new TeamMembersController(service.Object);

        var result = await controller.DeleteMember(1, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(dto, ok.Value);
    }

    [Fact]
    public async Task DeleteMember_ReturnsNotFound_WhenNotFound()
    {
        var service = new Mock<ITeamMemberService>();
        service
            .Setup(s => s.SoftDeleteMemberAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TeamMemberResponseDto?)null);

        var controller = new TeamMembersController(service.Object);

        var result = await controller.DeleteMember(99, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }
}
