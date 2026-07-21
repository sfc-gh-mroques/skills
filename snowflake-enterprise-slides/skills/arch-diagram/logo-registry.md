# Logo Registry — Architecture Diagrams

Verified SVG logo URLs for embedding in architecture diagrams via `<image href="..." />` inside SVG elements.

## Usage

```svg
<image href="URL" x="0" y="0" width="60" height="50" preserveAspectRatio="xMidYMid meet"/>
```

All URLs return SVG content and work in browser rendering (PDF export resolves them at render time).

## Registry

| Product | Logo URL | Brand Color | Category |
|---|---|---|---|
| Snowflake | `https://www.vectorlogo.zone/logos/snowflake/snowflake-icon.svg` | #29B5E8 | Platform |
| SAP | `https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg` | #0070F3 | ERP |
| Power BI | `https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg` | #F2C811 | BI |
| Dataiku | `https://cdn.simpleicons.org/dataiku/2AB1AC` | #2AB1AC | ML/DS |
| SnapLogic | `https://www.vectorlogo.zone/logos/snaplogic/snaplogic-icon.svg` | #4B8DF8 | Integration |
| Tableau | `https://cdn.simpleicons.org/tableau/E97627` | #E97627 | BI |
| dbt | `https://cdn.simpleicons.org/dbt/FF694B` | #FF694B | Transform |
| Databricks | `https://cdn.simpleicons.org/databricks/FF3621` | #FF3621 | Platform |
| Azure | `https://cdn.simpleicons.org/microsoftazure/0078D4` | #0078D4 | Cloud |
| AWS | `https://cdn.simpleicons.org/amazonaws/232F3E` | #FF9900 | Cloud |
| Google Cloud | `https://cdn.simpleicons.org/googlecloud/4285F4` | #4285F4 | Cloud |
| Fivetran | `https://cdn.simpleicons.org/fivetran/0073FF` | #0073FF | Integration |
| Informatica | `https://cdn.simpleicons.org/informatica/FF4D00` | #FF4D00 | Integration |
| Talend | `https://cdn.simpleicons.org/talend/1675BC` | #1675BC | Integration |
| Qlik | `https://cdn.simpleicons.org/qlik/009848` | #009848 | BI |
| Looker | `https://cdn.simpleicons.org/looker/4285F4` | #4285F4 | BI |
| Python | `https://cdn.simpleicons.org/python/3776AB` | #3776AB | Code |
| Kafka | `https://cdn.simpleicons.org/apachekafka/231F20` | #231F20 | Streaming |
| Airflow | `https://cdn.simpleicons.org/apacheairflow/017CEE` | #017CEE | Orchestration |
| Terraform | `https://cdn.simpleicons.org/terraform/7B42BC` | #7B42BC | IaC |
| Docker | `https://cdn.simpleicons.org/docker/2496ED` | #2496ED | Container |
| Kubernetes | `https://cdn.simpleicons.org/kubernetes/326CE5` | #326CE5 | Container |
| PostgreSQL | `https://cdn.simpleicons.org/postgresql/4169E1` | #4169E1 | Database |
| MongoDB | `https://cdn.simpleicons.org/mongodb/47A248` | #47A248 | Database |
| Salesforce | `https://cdn.simpleicons.org/salesforce/00A1E0` | #00A1E0 | CRM |
| HubSpot | `https://cdn.simpleicons.org/hubspot/FF7A59` | #FF7A59 | CRM |
| Streamlit | `https://cdn.simpleicons.org/streamlit/FF4B4B` | #FF4B4B | App |

## Fallback

If a logo is not in this registry:
1. Try `https://cdn.simpleicons.org/{product_name_lowercase}` (Simple Icons CDN)
2. Try `https://www.vectorlogo.zone/logos/{product}/{product}-icon.svg`
3. As last resort, create a branded pill with the product name in its brand color:
```svg
<g transform="translate(X, Y)">
  <rect width="80" height="36" rx="6" fill="{brand_color}" opacity="0.1" stroke="{brand_color}" stroke-width="1.2"/>
  <text x="40" y="23" text-anchor="middle" font-size="11" font-weight="700" fill="{brand_color}">PRODUCT</text>
</g>
```
