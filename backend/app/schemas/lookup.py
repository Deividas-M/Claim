from pydantic import BaseModel


class LookupItem(BaseModel):
    id: str
    name: str


class OrderHierarchyItem(BaseModel):
    order_id: str
    order_line_id: str
    component_id: str
