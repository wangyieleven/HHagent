import csv,json
from pathlib import Path
root=Path('dibj_site_data_csv_2026-09-02')
def rows(name):return list(csv.DictReader(open(root/name,encoding='utf-8-sig')))
gov=[{k:r[k] for k in ['id','data_name','dept_name','domain_name','is_open','is_shared','data_time','data_url']} for r in rows('07_政府侧数据.csv')]
scenes=[{k:r[k] for k in ['id','biz_unique_id','scene_name','scene_range','scene_type','data_time','scene_innovation_demand']} for r in rows('17_场景需求.csv')]
cloud=[{k:r[k] for k in ['id','resource_name','description','catalog_name']} for r in rows('13_云网算资源.csv')]
Path('site/data').mkdir(exist_ok=True)
Path('site/data/hehe-catalog-20260902.json').write_text(json.dumps({'snapshot':'2026-09-02','gov':gov,'scenes':scenes,'cloud':cloud},ensure_ascii=False))
traffic=[r for r in gov if r['domain_name']=='交通运输'];dept=[r for r in traffic if r['dept_name']=='北京市交通委员会']
from collections import Counter
print({'gov':len(gov),'traffic':len(traffic),'traffic_dept':len(dept),'open':sum(r['is_open']=='是' for r in dept),'scene_range':dict(Counter(r['scene_range'] for r in scenes))})
