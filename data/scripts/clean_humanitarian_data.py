import pandas as pd

# # Read in funding data
df_incoming_funding = pd.read_csv("../raw/humanitarian/funding/fts_incoming_funding_afg.csv", parse_dates=['date'])

# # Delete 2nd row of HXL tags
df_incoming_funding.drop([0], inplace=True)
df_incoming_funding.reset_index(drop=True, inplace=True)

# # Cut out unnecessary columns
# df_incoming_funding = df_incoming_funding[
#                         ['date', 'amountUSD', 'srcOrganization', 
#                         'srcOrganizationTypes', 'srcUsageYearStart',
#                         'destOrganization',	'destOrganizationTypes',	
#                         'destGlobalClusters']
#                         ]

# # Parse out country
# country = []
# for nt in df_incoming_funding.itertuples():
#     if nt.srcOrganizationTypes == "Government":
#         country.append(nt.srcOrganization.split(",")[0])
#     else:
#         country.append("")
# df_incoming_funding["country"] = country        

# # Rename columns
# df_incoming_funding.rename(columns={
#     'srcUsageYearStart':'year', 
#     'destGlobalClusters': "cluster"
#     }, inplace=True)

# # Update data types
# df_incoming_funding[['amountUSD', 'year']] = df_incoming_funding[['amountUSD', 'year']].astype("float")

# Grouper funciton
def groupsum(df, group_cols, agg_cols):
    grouped = df.groupby(group_cols)[agg_cols].sum()
    return pd.DataFrame(grouped.reset_index())

# # Clean up cluster types to match other datasets
# df_incoming_funding['cluster'] = df_incoming_funding['cluster'].str.strip().str.replace("and", "&").drop_duplicates()

# multi = []
# for i in df_incoming_funding['cluster']:
#     if "," in str(i):
#         multi.append("Multiple Sectors")
#     else:
#         multi.append(i)
# df_incoming_funding['cluster'] = multi

# repl_values = {
#    "Coordination and support services": "Coordination & Support Services",
#    "Protection - Mine Action": "Protection",
#    "Multi-sector": "Multiple Sectors",
#    "Food Security": "Food Security & Agriculture",
#    "Emergency Shelter and NFI": "Emergency Shelter",
#    "Protection - Child Protection": "Protection",
#    "Protection - Gender-Based Violence": "Protection",
#    "Water Sanitation Hygiene": "Water, Sanitation & Hygiene"
# }

# df_incoming_funding.replace({"cluster": repl_values}, inplace=True)

# # Group by donor, year, cluster
# grouped_donor = groupsum(df_incoming_funding, ["year", "srcOrganization", "cluster"], 'amountUSD')

# # Group by donor, year, cluster filtered to governments
# grouped_donor_govt_only = groupsum(df_incoming_funding.query('srcOrganizationTypes == "Government"'), ["year", "country", "cluster"], 'amountUSD')

# # To csv
# df_incoming_funding.to_csv("../cleaned/humanitarian/donor_data.csv")
# grouped_donor.to_csv("../cleaned/humanitarian/grouped_donor.csv")
# grouped_donor_govt_only.to_csv("../cleaned/humanitarian/grouped_donor_govt_only.csv")

# ##########

# ##########

# # Read in humanitarian funding and requirements data
# df_funding_req = pd.read_csv("../raw/humanitarian/funding/fts_requirements_funding_cluster_afg.csv")
# df_funding_req.drop([0], inplace=True)
# df_funding_req.reset_index(drop=True, inplace=True)

# # Reduce to columns that matter most
# df_funding_req = df_funding_req[['year', 'cluster', 'requirements', 'funding']]

# # Cast to proper data types
# df_funding_req[['year', 'requirements', 'funding']] = df_funding_req[['year', 'requirements', 'funding']].astype('float')

# # Create percent_funded column
# df_funding_req['percent_funded'] = df_funding_req['funding'] / df_funding_req['requirements']

# # Fix up columns and merge duplicate categories
# df_funding_req['cluster'] = df_funding_req['cluster'].str.replace("COVID-19", "")
# df_funding_req['cluster'] = df_funding_req['cluster'].str.strip().str.lower()

# repl_vals =  {
#         "multiple clusters/sectors (shared)":"multiple sectors",
#         "food security": "food security & agriculture",
#         "food security and agriculture": "food security & agriculture",
#         "multi-sector": "multiple sectors",
#         "not yet specifiied": "not specified",
#         "water,sanitation and hygiene": "water, sanitation & hygiene",
#         "water, sanitation and hygiene": "water, sanitation & hygiene",
#         "emergency shelter and nfi": "emergency shelter",
#         "coordination and support services": "coordination & support services",
#         "coordination":"coordination & support services",
#         "coordination and common services": "coordination & support services",
#         "cluster not yet specified": "not specified",
#         "multipurpose cash/ idps/ multisector": "multiple sectors",
#         "emergency shelter and nfis": "emergency shelter",
#         "multi purpose cash": "multiple sectors",
#         "multi-sectoral activities": "multiple sectors",
#         "education in emergencies wg": "education in emergencies",
#         "nutirition": "nutrition",
#         "aviation services": "aviation",
#         "logistics/ unhas flights": "logistics"
#     }
# df_funding_req.replace({"cluster": repl_vals}, inplace=True)
# df_funding_req['cluster'] = df_funding_req['cluster'].str.title()

# # Write to csv
# df_funding_req.to_csv("../cleaned/humanitarian/funding_req.csv", index=False)

# # Grouped by year and cluster
# grouped_funding_req = groupsum(df_funding_req, ["year", "cluster"], ['requirements', 'funding'])
# grouped_funding_req['percent_funded'] = grouped_funding_req['funding'] / grouped_funding_req['requirements']

# # Write grouped data to csv
# grouped_funding_req.to_csv("../cleaned/humanitarian/grouped_funding_req.csv", index=False)

##########

##########

# Read in new donor data
df_donors = pd.read_csv("../raw/humanitarian/funding/donors/donors_combined.csv")

# Merge organization type with previous dataset
df_donors = pd.merge(df_donors, df_incoming_funding[["srcOrganization", "srcOrganizationTypes"]].drop_duplicates(), how="left", on="srcOrganization")
df_donors = df_donors[df_donors['srcOrganization'].notna()]

# Manually fill well-known donors
un_agency = [
    "World Food Programme",
    "United Nations High Commissioner for Refugees", 
    "United Nations Mine Action Service",
    "United Nations Development Programme",
    "United Nations Population Fund",
    "United Nations Office for Project Services",
    "UN Agencies (Confidential)",
    "UNICEF National Committee/United Kingdom",
    "Office for the Coordination of Humanitarian Affairs"
]

pooled = [
    "Afghanistan Humanitarian Fund",
    "Afghanistan ERF (until 2014)",
    "Multi-donor flexible humanitarian contribution (UNICEF Global Humanitarian Thematic)"
]


# Parse out country
country = []
for nt in df_donors.itertuples():    
    if "Government" in str(nt.srcOrganization):
        country.append(nt.srcOrganization.split(",")[0])
    else:
        country.append("")
df_donors["country"] = country

df_donors["srcOrganization"] = df_donors["srcOrganization"].str.strip()

df_donors.loc[(df_donors['country'] != ''), 'srcOrganizationTypes'] = 'Government'

orgtypes = []
for nt in df_donors.itertuples():    
    if nt.srcOrganization in un_agency:
        orgtypes.append("UN agency")
    elif nt.srcOrganization in pooled:
        orgtypes.append("Pooled fund")
    else:
        orgtypes.append( nt.srcOrganizationTypes)
df_donors["srcOrganizationTypes"] = orgtypes


# Fill remainder with Other
df_donors['srcOrganizationTypes'].fillna("Other", inplace=True)


# Update data types
df_donors[['amountUSD', 'year']] = df_donors[['amountUSD', 'year']].astype("float")

# Group by donor, year, cluster filtered to governments
grouped_donor_govt_only_updated = groupsum(df_donors.query('country != "" '), ["year", "country", "cluster"], 'amountUSD')

# Overwrite srcOrganization column with country if it's available
srcOrg = []
for nt in df_donors.itertuples():
    if nt.country != "":
        srcOrg.append(nt.country)
    else:
        srcOrg.append(nt.srcOrganization)
df_donors['srcOrganization'] = srcOrg

# Group by donor, year, cluster
grouped_donor_cluster = groupsum(df_donors, ["year", "srcOrganization","srcOrganizationTypes","cluster"], 'amountUSD')
grouped_donor_updated = groupsum(df_donors, ["year", "srcOrganization", "srcOrganizationTypes"], 'amountUSD')

# Get unique of each column
years = pd.DataFrame(grouped_donor_updated['year'].drop_duplicates())
orgs = pd.DataFrame(grouped_donor_updated['srcOrganization'].drop_duplicates())
# clusters = pd.DataFrame(grouped_donor_updated['cluster'].drop_duplicates())

years['key'] = 1
orgs['key'] = 1
# clusters['key'] = 1

# Get all possible combinations of years, orgs, clusters
combos = pd.merge(years, orgs, on="key")
# combos = pd.merge(combos, clusters, on="key")
combos.drop("key", 1, inplace=True)

# Left join each on grouped_donor_updated to bring in amountUSD
grouped_donor_updated = pd.merge(combos, grouped_donor_updated, how="left")

# Fill nulls with 0
grouped_donor_updated['amountUSD'].fillna(0, inplace=True)

# To csv
df_donors.to_csv("../cleaned/humanitarian/donor_data_updated.csv", index=False)
grouped_donor_updated.to_csv("../cleaned/humanitarian/grouped_donor_updated.csv", index=False)
grouped_donor_govt_only_updated.to_csv("../cleaned/humanitarian/grouped_donor_govt_only_updated.csv", index=False)