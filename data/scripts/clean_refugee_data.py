import pandas as pd
import glob
import os


# Read in asylum seeker and refugee data
df_asylum_refugee = pd.read_csv("../raw/refugee/asylum seekers and refugees/demographics_originating_afg.csv")

# Remove 2nd row HXL tags
df_asylum_refugee.drop([0], inplace=True)
df_asylum_refugee.reset_index(drop=True, inplace=True)

# Get rid of unnecessary columns
df_asylum_refugee = df_asylum_refugee[
                        ['Year', 
                        'Country of Asylum Code', 
                        'Country of Asylum Name',
                        'Population Type',
                        'location',
                        'Total']
                    ]

# Update datatypes
df_asylum_refugee = df_asylum_refugee.astype({"Year": int, "Total": int})

# Write to cleaned data directory
df_asylum_refugee.to_csv("../cleaned/refugee/asylum_refugee.csv", index=False)

# Group by country, year, population type
grouped_asylum_refugee = df_asylum_refugee.groupby(['Year', 'Country of Asylum Name', 'Population Type'])['Total'].sum()
grouped_asylum_refugee = pd.DataFrame(grouped_asylum_refugee.reset_index())

# Write to cleaned data directory 
grouped_asylum_refugee.to_csv("../cleaned/refugee/grouped_asylum_refugee.csv", index=False)



# Import and concat repatriation datasets
path = "../raw/refugee/repatriation/"
all_files = glob.glob(os.path.join(path, "*.csv"))
df_repatriation = pd.concat((pd.read_csv(f, parse_dates=['RETURN_DATE'], thousands=',') for f in all_files), ignore_index=True)

# Group by country, month
df_repatriation['month'] = df_repatriation['RETURN_DATE'].dt.month
df_repatriation['year'] = df_repatriation['RETURN_DATE'].dt.year
grouped_repatriation = df_repatriation.groupby(['COUNTRY_OF_ASYLUM', 'month', 'year'])['INDIVIDUALS'].sum()
grouped_repatriation = pd.DataFrame(grouped_repatriation.reset_index())

# Add date column from month and year values
grouped_repatriation['date'] = pd.to_datetime(grouped_repatriation.assign(Day=1).loc[:, ['year','month','Day']])

# Reorder columns
grouped_repatriation = grouped_repatriation[['COUNTRY_OF_ASYLUM', 'date', 'month', 'year', 'INDIVIDUALS']]

# Write to cleaned data directory 
grouped_repatriation.to_csv("../cleaned/refugee/repatriation.csv", index=False)