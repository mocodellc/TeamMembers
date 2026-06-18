using backend.Contracts;
using backend.Controllers;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace backend.Tests.Controllers;

public sealed class TeamGroupsControllerTests
{
    private static TeamGroupResponseDto MakeGroupDto(int id = 1, string name = "Engineering") =>
        new(id, name, "Engineering team", DateTimeOffset.UtcNow);

    [Fact]
    public async Task GetGroups_ReturnsOk_WithGroups()
    {
        var groups = new List<TeamGroupResponseDto> { MakeGroupDto() };
        var service = new Mock<ITeamGroupService>();
        service.Setup(s => s.GetGroupsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(groups);

        var controller = new TeamGroupsController(service.Object);

        var result = await controller.GetGroups(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, ok.StatusCode);
        Assert.Equal(groups, ok.Value);
    }

    [Fact]
    public async Task CreateGroup_ReturnsCreated_WhenSucceeds()
    {
        var dto = MakeGroupDto();
        var service = new Mock<ITeamGroupService>();
        service
            .Setup(s => s.CreateGroupAsync(It.IsAny<TeamGroupUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(dto);

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.CreateGroup(
            new TeamGroupUpsertRequestDto { Name = "Engineering", Description = "Eng team" },
            CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(StatusCodes.Status201Created, created.StatusCode);
        Assert.Equal(dto, created.Value);
    }

    [Fact]
    public async Task CreateGroup_ReturnsBadRequest_WhenValidationFails()
    {
        var service = new Mock<ITeamGroupService>();
        service
            .Setup(s => s.CreateGroupAsync(It.IsAny<TeamGroupUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ServiceValidationException("Group Name is required."));

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.CreateGroup(new TeamGroupUpsertRequestDto(), CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateGroup_ReturnsConflict_WhenNameIsDuplicate()
    {
        var service = new Mock<ITeamGroupService>();
        service
            .Setup(s => s.CreateGroupAsync(It.IsAny<TeamGroupUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ServiceConflictException("A group with this Name already exists."));

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.CreateGroup(
            new TeamGroupUpsertRequestDto { Name = "Dup", Description = "Dup" },
            CancellationToken.None);

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task UpdateGroup_ReturnsOk_WhenFound()
    {
        var dto = MakeGroupDto();
        var service = new Mock<ITeamGroupService>();
        service
            .Setup(s => s.UpdateGroupAsync(1, It.IsAny<TeamGroupUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(dto);

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.UpdateGroup(
            1,
            new TeamGroupUpsertRequestDto { Name = "Engineering", Description = "Updated" },
            CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(dto, ok.Value);
    }

    [Fact]
    public async Task UpdateGroup_ReturnsNotFound_WhenServiceReturnsNull()
    {
        var service = new Mock<ITeamGroupService>();
        service
            .Setup(s => s.UpdateGroupAsync(99, It.IsAny<TeamGroupUpsertRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TeamGroupResponseDto?)null);

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.UpdateGroup(
            99,
            new TeamGroupUpsertRequestDto { Name = "X", Description = "X" },
            CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteGroup_ReturnsNoContent_WhenDeleted()
    {
        var service = new Mock<ITeamGroupService>();
        service.Setup(s => s.DeleteGroupAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.DeleteGroup(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteGroup_ReturnsNotFound_WhenNotFound()
    {
        var service = new Mock<ITeamGroupService>();
        service.Setup(s => s.DeleteGroupAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.DeleteGroup(99, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteGroup_ReturnsConflict_WhenHasMembers()
    {
        var service = new Mock<ITeamGroupService>();
        service
            .Setup(s => s.DeleteGroupAsync(1, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ServiceConflictException("Cannot delete group while members are assigned."));

        var controller = new TeamGroupsController(service.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var result = await controller.DeleteGroup(1, CancellationToken.None);

        Assert.IsType<ConflictObjectResult>(result);
    }
}
