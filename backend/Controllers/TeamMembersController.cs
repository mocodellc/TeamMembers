using backend.Contracts;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberService _teamMemberService;

    public TeamMembersController(ITeamMemberService teamMemberService)
    {
        _teamMemberService = teamMemberService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TeamMemberResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMembers([FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var members = await _teamMemberService.GetMembersAsync(includeDeleted, cancellationToken);
        return Ok(members);
    }

    [HttpGet("{teamMemberId:int}")]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMemberById([FromRoute] int teamMemberId, CancellationToken cancellationToken = default)
    {
        var member = await _teamMemberService.GetMemberByIdAsync(teamMemberId, cancellationToken);
        if (member is null)
        {
            return NotFound();
        }

        return Ok(member);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateMember([FromBody] TeamMemberUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        try
        {
            var created = await _teamMemberService.CreateMemberAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetMemberById), new { teamMemberId = created.TeamMemberId }, created);
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

    [HttpPut("{teamMemberId:int}")]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateMember([FromRoute] int teamMemberId, [FromBody] TeamMemberUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _teamMemberService.UpdateMemberAsync(teamMemberId, request, cancellationToken);
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

    [HttpDelete("{teamMemberId:int}")]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMember([FromRoute] int teamMemberId, CancellationToken cancellationToken = default)
    {
        var deleted = await _teamMemberService.SoftDeleteMemberAsync(teamMemberId, cancellationToken);
        if (deleted is null)
        {
            return NotFound();
        }

        return Ok(deleted);
    }

    [HttpPost("{teamMemberId:int}/undelete")]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UndeleteMember([FromRoute] int teamMemberId, CancellationToken cancellationToken = default)
    {
        var restored = await _teamMemberService.UndeleteMemberAsync(teamMemberId, cancellationToken);
        if (restored is null)
        {
            return NotFound();
        }

        return Ok(restored);
    }
}
