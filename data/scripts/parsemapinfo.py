import geopandas
import pandas as pd

#load map data
url = "https://code.highcharts.com/mapdata/countries/af/af-all.topo.json"
df = geopandas.read_file(url)


# load conflict data
aclead_df = pd.read_csv(r'\\wsl.localhost\Ubuntu\home\tadhglooram\classes\CS171\git\CS171Project\implementation\data\datadump\conflict_ACLEAD\1997-01-01-2022-11-07-Afghanistan.csv')

# filter dates will do late

#group by regions
aclead_gb = aclead_df.groupby(by=["admin1"]).sum()

#drop columns
fatalities = aclead_gb[['fatalities']]
hc_keys = df[['hc-key','name']]
join = hc_keys.set_index('name').join(fatalities)
join.sort_values(by=['fatalities'],inplace=True)

#clean output for map
['af-bm',71.0]
['af-nr',902.0],
['af-pv',915.0],
['f-2030',915.0],
['af-sm',1251.0],
['af-kt',1599.0],
['af-kp',2367.0],
['af-gr',2778.0],
['af-la',3114.0],
['af-kr',3402.0],
['af-pk',3857.0],
['af-kb',4139.0],
['af-lw',4140.0],
['af-vr',4205.0],
['af-bd',4435.0],
['af-tk',4700.0],
['af-bg',5726.0],
['af-bl',6044.0],
['af-zb',6621.0],
['af-fh',7393.0],
['af-bk',7453.0],
['af-kz',9774.0],
['af-fb',10030.0],
['af-gz',16446.0],
['af-kd',18741.0],
['af-ng',19197.0],
['af-hm',17718],
['af-hr',6571],
['af-jw',4885],
['af-nm',1324],
['af-pt',4381],
['af-sp',2344],
['f-2014',10348],
['af-oz',10348]



#GeoJson file of Afghanistan districts:

import geopandas
import pandas as pd

#load map data
path  = r"\\wsl.localhost\Ubuntu\home\tadhglooram\classes\CS171\git\CS171Project\implementation\Afghanistan_Map\data\Afghanistan_Districts.geojson"
df = geopandas.read_file(path)
