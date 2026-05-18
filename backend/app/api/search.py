from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import SearchHistory
from app.schemas.schemas import SearchRequest, SearchResponse
from app.services.serpapi_service import search_customers

router = APIRouter(prefix="/api", tags=["search"])

# Use a placeholder user_id since auth is skipped for MVP
PLACEHOLDER_USER_ID = "demo-user-001"


@router.post("/search-customers", response_model=SearchResponse)
async def search_customers_endpoint(req: SearchRequest, db: Session = Depends(get_db)):
    results = await search_customers(
        product=req.product,
        market=req.market,
        industry=req.industry,
        limit=req.limit,
    )

    # Save search history
    history = SearchHistory(
        user_id=PLACEHOLDER_USER_ID,
        query=f"{req.product} {req.market} {req.industry}".strip(),
        product=req.product,
        market=req.market,
        industry=req.industry,
        results_count=len(results),
    )
    db.add(history)
    db.commit()

    return SearchResponse(success=True, data=results, count=len(results))
