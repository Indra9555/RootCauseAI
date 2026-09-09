from fastapi import APIRouter, HTTPException

from analysis.log_analysis_service import run_analysis


router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"]
)


@router.get("/root-cause")
def root_cause_analysis():
    """
    Run RootCauseAI analysis on the stored telemetry logs.
    """

    try:
        result = run_analysis()

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )