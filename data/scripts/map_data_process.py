import pandas as pd

#load csv
df = pd.read_excel(r'\\wsl.localhost\Ubuntu\home\tadhglooram\classes\CS171\git\CS171Project\implementation\Afghanistan_Map\data\taliban_takeover2.xlsx')
# convert columns to str
df.columns = df.columns.astype(str)
# keep columns
df = df[['Districts',
       '2021-05-11 00:00:00', '2021-05-12 00:00:00', '2021-06-07 00:00:00',
       '2021-06-08 00:00:00', '2021-06-12 00:00:00', '2021-06-13 00:00:00',
       '2021-06-14 00:00:00', '2021-06-15 00:00:00', '2021-06-20 00:00:00',
       '2021-06-21 00:00:00', '2021-06-23 00:00:00', '2021-06-24 00:00:00',
       '2021-06-25 00:00:00', '2021-06-27 00:00:00', '2021-06-29 00:00:00',
       '2021-06-30 00:00:00', '2021-07-03 00:00:00', '2021-07-04 00:00:00',
       '2021-07-05 00:00:00', '2021-07-06 00:00:00', '2021-07-10 00:00:00',
       '2021-07-11 00:00:00', '2021-07-12 00:00:00', '2021-07-13 00:00:00',
       '2021-07-14 00:00:00', '2021-07-18 00:00:00', '2021-07-22 00:00:00',
       '2021-07-25 00:00:00', '2021-08-06 00:00:00', '2021-08-07 00:00:00',
       '2021-08-08 00:00:00', '2021-08-10 00:00:00', '2021-08-11 00:00:00',
       '2021-08-12 00:00:00', '2021-08-13 00:00:00', '2021-08-14 00:00:00',
       '2021-08-16 00:00:00']]
#store columns to pivot on
pivot_on = ['2021-05-11 00:00:00', '2021-05-12 00:00:00', '2021-06-07 00:00:00',
       '2021-06-08 00:00:00', '2021-06-12 00:00:00', '2021-06-13 00:00:00',
       '2021-06-14 00:00:00', '2021-06-15 00:00:00', '2021-06-20 00:00:00',
       '2021-06-21 00:00:00', '2021-06-23 00:00:00', '2021-06-24 00:00:00',
       '2021-06-25 00:00:00', '2021-06-27 00:00:00', '2021-06-29 00:00:00',
       '2021-06-30 00:00:00', '2021-07-03 00:00:00', '2021-07-04 00:00:00',
       '2021-07-05 00:00:00', '2021-07-06 00:00:00', '2021-07-10 00:00:00',
       '2021-07-11 00:00:00', '2021-07-12 00:00:00', '2021-07-13 00:00:00',
       '2021-07-14 00:00:00', '2021-07-18 00:00:00', '2021-07-22 00:00:00',
       '2021-07-25 00:00:00', '2021-08-06 00:00:00', '2021-08-07 00:00:00',
       '2021-08-08 00:00:00', '2021-08-10 00:00:00', '2021-08-11 00:00:00',
       '2021-08-12 00:00:00', '2021-08-13 00:00:00', '2021-08-14 00:00:00',
       '2021-08-16 00:00:00']
#set district as index
df.set_index('Districts',inplace=True)
#stack data
df_stack = pd.DataFrame(df.stack())
#reset index
df_stack.reset_index(inplace=True)
#rename columns
df_stack.rename(columns={"Districts":"id","level_1":"date",0:'taliban_control'},inplace=True)
#export data
df_stack.to_csv(r'\\wsl.localhost\Ubuntu\home\tadhglooram\classes\CS171\git\CS171Project\implementation\Afghanistan_Map\data\taliban_takeover.csv',index=False)