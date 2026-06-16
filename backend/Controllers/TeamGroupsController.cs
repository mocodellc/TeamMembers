using backend.Contracts;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TeamGroupsController : ControllerBase
{
    private readonly ITeamGroupService _teamGroupService;

    public TeamGroupsController(ITeamGroupService teamGroupService)
    {
        _teamGroupService = teamGroupService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TeamGroupResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGroups(CancellationToken cancellationToken = default)
    {
        var groups = await _teamGroupService.GetGroupsAsync(cancellationToken);
        return Ok(groups);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TeamGroupResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateGroup([FromBody] TeamGroupUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        try
        {
            var created = await _teamGroupService.CreateGroupAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetGroups), new { teamGroupId = created.TeamGroupId }, created);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest));
        }
        catch (ServiceConflictException ex)
        {
            return Conflict(Problem(detail: ex.Message, statusCode: StatusCodes.Status409Conflict));
        }
    }

    [HttpPut("{teamGroupId:int}")]
    [ProducesResponseType(typeof(TeamGroupResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateGroup([FromRoute] int teamGroupId, [FromBody] TeamGroupUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _teamGroupService.UpdateGroupAsync(teamGroupId, request, cancellationToken);
            if (updated is null)
            {
                return NotFound();
            }

            return Ok(updated);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest));
        }
        catch (ServiceConflictException ex)
        {
            return Conflict(Problem(detail: ex.Message, statusCode: StatusCodes.Status409Conflict));
        }
    }

    [HttpDelete("{teamGroupId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteGroup([FromRoute] int teamGroupId, CancellationToken cancellationToken = default)
    {
        try
        {
            var deleted = await _teamGroupService.DeleteGroupAsync(teamGroupId, cancellationToken);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ServiceConflictException ex)
        {
            return Conflict(Problem(detail: ex.Message, statusCode: StatusCodes.Status409Conflict));
        }
    }
}
