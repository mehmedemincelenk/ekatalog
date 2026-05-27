import json
import os

def main():
    json_path = "/home/mec/Desktop/codes/ekatalog/public/leads_with_website.json"
    sql_path = "/home/mec/Desktop/codes/ekatalog/public/seed_leads.sql"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        leads = json.load(f)
        
    print(f"Total leads loaded from JSON: {len(leads)}")
    
    # Generate bulk INSERT statements
    # We will do it in chunks of 100 to avoid overly large SQL statements
    chunk_size = 100
    sql_lines = []
    sql_lines.append("-- Seeding leads table from istanbul_endTem.pdf data")
    sql_lines.append("TRUNCATE TABLE public.leads CASCADE;")
    sql_lines.append("")
    
    for i in range(0, len(leads), chunk_size):
        chunk = leads[i:i+chunk_size]
        values = []
        for lead in chunk:
            name = lead.get('name', '').replace("'", "''")
            phone = lead.get('phone', '').replace("'", "''")
            website = lead.get('website', '').replace("'", "''")
            address = lead.get('address', '').replace("'", "''")
            slug = lead.get('slug', '').replace("'", "''")
            
            metadata = json.dumps({"address": address, "slug": slug}, ensure_ascii=False).replace("'", "''")
            values.append(f"(gen_random_uuid(), '{phone}', '{metadata}'::jsonb, '{website}', false, '{name}')")
            
        insert_statement = f"INSERT INTO public.leads (id, phone, metadata, website, onboarded, company_name) VALUES\n" + ",\n".join(values) + ";"
        sql_lines.append(insert_statement)
        sql_lines.append("")
        
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))
        
    print(f"SQL file successfully created at: {sql_path}")

if __name__ == "__main__":
    main()
