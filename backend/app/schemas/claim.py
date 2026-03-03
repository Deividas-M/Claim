from datetime import datetime

from pydantic import BaseModel, Field


class IdentifierLevel(BaseModel):
    info_message: str = Field(min_length=1, max_length=500)
    status_id: str = Field(min_length=1, max_length=50)
    priority_id: str = Field(min_length=1, max_length=50)
    communication_emails: list[str] = Field(default_factory=list)


class Identifiers(BaseModel):
    order: IdentifierLevel
    order_line: IdentifierLevel
    component: IdentifierLevel


class ClaimCreate(BaseModel):
    claim_id: str | None = Field(default=None, max_length=100)
    user_id: str = Field(min_length=1, max_length=50)
    claim_type_id: str = Field(min_length=1, max_length=50)
    status_id: str = Field(min_length=1, max_length=50)
    priority_id: str = Field(min_length=1, max_length=50)
    order_id: str = Field(min_length=1, max_length=100)
    order_line_id: str = Field(min_length=1, max_length=100)
    component_id: str = Field(min_length=1, max_length=100)
    identifiers: Identifiers


class ClaimUpdate(BaseModel):
    user_id: str = Field(min_length=1, max_length=50)
    claim_type_id: str = Field(min_length=1, max_length=50)
    status_id: str = Field(min_length=1, max_length=50)
    priority_id: str = Field(min_length=1, max_length=50)


class ClaimStage2Update(BaseModel):
    reason: str = Field(default="", max_length=2000)
    suggested_actions: str = Field(default="", max_length=2000)
    comments: str = Field(default="", max_length=2000)


class ClaimListItem(BaseModel):
    claim_id: str
    user_id: str
    claim_type_id: str
    status_id: str
    priority_id: str
    created_at: datetime


class ClaimDetails(BaseModel):
    claim_id: str
    user_id: str
    claim_type_id: str
    status_id: str
    priority_id: str
    order_id: str
    order_line_id: str
    component_id: str
    reason: str
    suggested_actions: str
    comments: str
    created_at: datetime


class AttachmentMeta(BaseModel):
    id: int
    claim_id: str
    file_name: str
    content_type: str
    size_bytes: int
    storage_path: str
    created_by: str
    created_at: datetime
