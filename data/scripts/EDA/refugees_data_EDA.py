import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("../cleaned/refugee/repatriation.csv", parse_dates=['date'])

fig, axs = plt.subplots(2,1,figsize=(12,12))
sns.lineplot(
    data = df,
    x = "date",
    y = "INDIVIDUALS",    
    ci=None,
    ax=axs[0]
)
axs[0].set_xlabel(None)
axs[0].axvline(pd.to_datetime("2021-08-31"), color="gray", linestyle="--")
axs[0].set_ylabel("Repatriated Migrants")

sns.lineplot(
    data = df,
    x = "date",
    y = "INDIVIDUALS",
    hue = "COUNTRY_OF_ASYLUM",
    ax=axs[1]
)
axs[1].set_xlabel(None)
axs[1].set_ylabel("Repatriated Migrants")
fig.suptitle("Migrant Repatriation", fontsize=24)
axs[1].axvline(pd.to_datetime("2021-08-31"), color="gray", linestyle="--")
plt.tight_layout()
plt.show()