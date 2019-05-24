
+++
title = "Reply Times"
date = "2017-11-09"
author = "Jake VanCampen"
comments = "true"
tags = ["jupyter-notebooks", "iMessageAnalyzer"]
+++


My girlfriend recently accused me of taking a long time to reply over text message, supposedly longer than her. This made me wonder about the actual numbers. To answer this question I would need to accesss the metadata from my imessages.. I was not entirely sure how to do this, but upon searching around for how to get these data I found a brilliant app by Ryan D'souza, the [iMessageAnalyzer](https://github.com/dsouzarc/iMessageAnalyzer). This allowed me to quickly download a csv of my conversation of interest.

Here I will explore the average time it takes me to reply to my girlfriend over iMessage. The data have been masked so that my name is 'me', and my girlfriend is 'gf'; the column containing the text message at each time point was removed.


```python
import pandas as pd 
```


```python
gf_txt = pd.read_csv('gftxt.csv', names=['person', 'time'], parse_dates=True, header=1)
```

It looks like all the information I need is in the first two columns: 'person' and 'time'. I'll store a new instance of the data frame. 


```python
gf_txt.head()
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>person</th>
      <th>time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>gf</td>
      <td>2015-06-21 21:56:16 +0000</td>
    </tr>
    <tr>
      <th>2</th>
      <td>me</td>
      <td>2015-06-21 22:00:32 +0000</td>
    </tr>
    <tr>
      <th>3</th>
      <td>gf</td>
      <td>2015-07-28 18:15:08 +0000</td>
    </tr>
    <tr>
      <th>4</th>
      <td>me</td>
      <td>2015-07-28 19:15:06 +0000</td>
    </tr>
    <tr>
      <th>5</th>
      <td>me</td>
      <td>2015-07-28 19:15:16 +0000</td>
    </tr>
  </tbody>
</table>
</div>




```python
gf_txt.dtypes
```




    person    object
    time      object
    dtype: object



Looks like I need to change the time column to datetime!


```python
gf_txt['time'] = pd.to_datetime(gf_txt['time'])
gf_txt2 = gf_txt.copy()
```


```python
gf_txt.head(20)
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>person</th>
      <th>time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>gf</td>
      <td>2015-06-21 21:56:16</td>
    </tr>
    <tr>
      <th>2</th>
      <td>me</td>
      <td>2015-06-21 22:00:32</td>
    </tr>
    <tr>
      <th>3</th>
      <td>gf</td>
      <td>2015-07-28 18:15:08</td>
    </tr>
    <tr>
      <th>4</th>
      <td>me</td>
      <td>2015-07-28 19:15:06</td>
    </tr>
    <tr>
      <th>5</th>
      <td>me</td>
      <td>2015-07-28 19:15:16</td>
    </tr>
    <tr>
      <th>6</th>
      <td>gf</td>
      <td>2015-07-28 19:33:53</td>
    </tr>
    <tr>
      <th>7</th>
      <td>me</td>
      <td>2015-07-28 20:02:39</td>
    </tr>
    <tr>
      <th>8</th>
      <td>me</td>
      <td>2015-07-28 21:42:38</td>
    </tr>
    <tr>
      <th>9</th>
      <td>gf</td>
      <td>2015-07-29 05:13:23</td>
    </tr>
    <tr>
      <th>10</th>
      <td>me</td>
      <td>2015-07-29 05:14:40</td>
    </tr>
    <tr>
      <th>11</th>
      <td>gf</td>
      <td>2015-07-29 05:26:33</td>
    </tr>
    <tr>
      <th>12</th>
      <td>me</td>
      <td>2015-07-29 14:08:14</td>
    </tr>
    <tr>
      <th>13</th>
      <td>me</td>
      <td>2015-08-01 19:12:19</td>
    </tr>
    <tr>
      <th>14</th>
      <td>gf</td>
      <td>2015-08-01 20:14:41</td>
    </tr>
    <tr>
      <th>15</th>
      <td>me</td>
      <td>2015-08-01 22:45:11</td>
    </tr>
    <tr>
      <th>16</th>
      <td>me</td>
      <td>2015-08-01 22:45:16</td>
    </tr>
    <tr>
      <th>17</th>
      <td>me</td>
      <td>2015-08-01 22:45:30</td>
    </tr>
    <tr>
      <th>18</th>
      <td>gf</td>
      <td>2015-08-01 22:48:19</td>
    </tr>
    <tr>
      <th>19</th>
      <td>me</td>
      <td>2015-08-01 22:48:34</td>
    </tr>
    <tr>
      <th>20</th>
      <td>gf</td>
      <td>2015-08-01 23:55:38</td>
    </tr>
  </tbody>
</table>
</div>




```python
gf_txt.dtypes
```




    person            object
    time      datetime64[ns]
    dtype: object



It is evident sometimes one person texts the other twice, three times, etc... I only want the difference between rows where 'person' changes. To do this I will create a new row called pdiff which is just person shifted up so that I can compare the next row (pnext) to the current row (person). Then I need to select only rows where 'person' is not equal to 'pnext'.


```python
# create pnext that is shifted version of person
gf_txt['pnext'] = gf_txt.person.shift(-1)

# make new dataframe where each row is a change in the person who is texting
gf_alt = gf_txt.loc[gf_txt['person'] != gf_txt['pnext']].copy()
gf_alt.head()
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>person</th>
      <th>time</th>
      <th>pnext</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>gf</td>
      <td>2015-06-21 21:56:16</td>
      <td>me</td>
    </tr>
    <tr>
      <th>2</th>
      <td>me</td>
      <td>2015-06-21 22:00:32</td>
      <td>gf</td>
    </tr>
    <tr>
      <th>3</th>
      <td>gf</td>
      <td>2015-07-28 18:15:08</td>
      <td>me</td>
    </tr>
    <tr>
      <th>5</th>
      <td>me</td>
      <td>2015-07-28 19:15:16</td>
      <td>gf</td>
    </tr>
    <tr>
      <th>6</th>
      <td>gf</td>
      <td>2015-07-28 19:33:53</td>
      <td>me</td>
    </tr>
  </tbody>
</table>
</div>



Great, now I can compute the time difference between the two entries. 


```python
# compute time difference in seconds as new column
gf_alt['tdiff'] = gf_alt['time'].diff().dt.seconds.div(60, fill_value = 0)
gf_alt.head()
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>person</th>
      <th>time</th>
      <th>pnext</th>
      <th>tdiff</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>gf</td>
      <td>2015-06-21 21:56:16</td>
      <td>me</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>2</th>
      <td>me</td>
      <td>2015-06-21 22:00:32</td>
      <td>gf</td>
      <td>4.266667</td>
    </tr>
    <tr>
      <th>3</th>
      <td>gf</td>
      <td>2015-07-28 18:15:08</td>
      <td>me</td>
      <td>1214.600000</td>
    </tr>
    <tr>
      <th>5</th>
      <td>me</td>
      <td>2015-07-28 19:15:16</td>
      <td>gf</td>
      <td>60.133333</td>
    </tr>
    <tr>
      <th>6</th>
      <td>gf</td>
      <td>2015-07-28 19:33:53</td>
      <td>me</td>
      <td>18.616667</td>
    </tr>
  </tbody>
</table>
</div>



The dataframe now has column 'tdiff' representing the time in minutes since the last person. Becasue I have ensured that persons are truely alternating, the 'tdiff' column represents the reply time for the current person. Let's see each person's average reply time since 2015.


```python
gf_alt[gf_alt['person'] == 'me'].mean()
```




    tdiff    134.83797
    dtype: float64




```python
gf_alt[gf_alt['person'] == 'gf'].mean()
```




    tdiff    159.375923
    dtype: float64



It appears I have the faster reply time since 2015... interesting. What do these data look like as a graph? 


```python
%matplotlib inline
```


```python
import matplotlib as mpl
import matplotlib.pyplot as plt
import matplotlib.dates as mdates 
```


```python
import seaborn as sns

```


```python
plt.plot(gf_alt['time'], gf_alt['tdiff'])
```




    [<matplotlib.lines.Line2D at 0x118cfd908>]




![png](output_22_1.png)


This does not help. Maybe a montly average will do.


```python
# select columns of interest
gf_tdex = gf_alt.filter(['person','tdiff', 'time'])
gf_tdex.head()
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>person</th>
      <th>tdiff</th>
      <th>time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>gf</td>
      <td>0.000000</td>
      <td>2015-06-21 21:56:16</td>
    </tr>
    <tr>
      <th>2</th>
      <td>me</td>
      <td>4.266667</td>
      <td>2015-06-21 22:00:32</td>
    </tr>
    <tr>
      <th>3</th>
      <td>gf</td>
      <td>1214.600000</td>
      <td>2015-07-28 18:15:08</td>
    </tr>
    <tr>
      <th>5</th>
      <td>me</td>
      <td>60.133333</td>
      <td>2015-07-28 19:15:16</td>
    </tr>
    <tr>
      <th>6</th>
      <td>gf</td>
      <td>18.616667</td>
      <td>2015-07-28 19:33:53</td>
    </tr>
  </tbody>
</table>
</div>




```python
gf_monthly = gf_tdex.groupby('person').resample('M', on='time').mean().reset_index()
gf_monthly.head()
gf_monthly['time'] = gf_monthly['time'].map(lambda x: x.strftime('%Y-%m-%d'))
```


```python
gf_monthly

fig, ax = plt.subplots()
sns.barplot('time', 'tdiff', data=gf_monthly, hue='person', ax=ax)
plt.xticks(rotation=80)
plt.xlabel('Month')
plt.ylabel('Average Reply time / month (minutes)')
plt.title('Distribution of Reply times/ month since 2015')
plt.tight_layout()
plt.savefig('replytimes.png', dpi=1000)
```


![png](output_26_0.png)


Ahh, this is more revealing! I was slower to reply each month on averaage from August 2015 until July 2016 when I became faster at replying to text messages on average every month. What this analysis overlooks is the difference in overnight text messages. The times that we really care about in terms of the 'time to reply' are only in the day time, and overnight time to reply could be skewing these averages. So I will remove texts form between 10pm and 6 am, then take the average reply times for this subset. 


```python
# new column with only date
gf_txt2['date'] = gf_txt2['time'].map(lambda x: str(x).split()[0])

# new column with only time
gf_txt2['hour'] = pd.to_timedelta(gf_txt2['time'].map(lambda x: str(x).split()[1]))

# set time mask 
mask = (gf_txt2['hour'] < pd.to_timedelta('22:00:00')) & (gf_txt2['hour'] > pd.to_timedelta('06:00:00'))
gf_daytime = gf_txt2[mask]

gf_daytime.head()
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>person</th>
      <th>time</th>
      <th>date</th>
      <th>hour</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>gf</td>
      <td>2015-06-21 21:56:16</td>
      <td>2015-06-21</td>
      <td>21:56:16</td>
    </tr>
    <tr>
      <th>3</th>
      <td>gf</td>
      <td>2015-07-28 18:15:08</td>
      <td>2015-07-28</td>
      <td>18:15:08</td>
    </tr>
    <tr>
      <th>4</th>
      <td>me</td>
      <td>2015-07-28 19:15:06</td>
      <td>2015-07-28</td>
      <td>19:15:06</td>
    </tr>
    <tr>
      <th>5</th>
      <td>me</td>
      <td>2015-07-28 19:15:16</td>
      <td>2015-07-28</td>
      <td>19:15:16</td>
    </tr>
    <tr>
      <th>6</th>
      <td>gf</td>
      <td>2015-07-28 19:33:53</td>
      <td>2015-07-28</td>
      <td>19:33:53</td>
    </tr>
  </tbody>
</table>
</div>



Filtering based on time like this made it so there were some repetative persons again, this can be fixed with a shift the same way it was before. 


```python
# create pnext that is shifted version of person
gf_daytime['pnext2'] = gf_daytime.person.shift(-1)

# make new dataframe where each row is a change in the person who is texting
gf_daytime = gf_daytime.loc[gf_daytime['person'] != gf_daytime['pnext2']]
gf_daytime.head()

# groupby date to remove diffs that carry over a day
group = gf_daytime.groupby(by='date')

# compute time difference in seconds as new column
gf_daytime['tdiff'] = group['time'].diff().dt.seconds.div(60, fill_value = 0)
gf_daytime.head(20)

# Select only non-zero rows
gf_daytime = gf_daytime[gf_daytime['tdiff'] != 0]
```

    /Users/JakeVanCampen/anaconda/lib/python3.6/site-packages/ipykernel_launcher.py:2: SettingWithCopyWarning: 
    A value is trying to be set on a copy of a slice from a DataFrame.
    Try using .loc[row_indexer,col_indexer] = value instead
    
    See the caveats in the documentation: http://pandas.pydata.org/pandas-docs/stable/indexing.html#indexing-view-versus-copy
      


The reply times that carry over a day need to be removed. 

Now the same monthly resampled averageing can be done and summarized in a plot.


```python
# select columns of interest
gf_daytime = gf_daytime.filter(['person','tdiff', 'time'])

gf_monthly2 = gf_daytime.groupby('person').resample('M', on='time').mean().reset_index()
gf_monthly2.head()
gf_monthly2['time'] = gf_monthly2['time'].map(lambda x: x.strftime('%Y-%m-%d'))


fig, ax = plt.subplots()
sns.barplot('time', 'tdiff', data=gf_monthly2, hue='person', ax=ax)
plt.xticks(rotation=80)
plt.xlabel('Month')
plt.ylabel('Average Reply time / month (minutes)')
plt.title('Average reply time betweeen 6am and 10pm \n per month since 2015')
plt.tight_layout()
plt.savefig('replytimes_day.png', dpi=1000)

print("My average reply time since 2015 between 6am and 10pm: " +
      str(round(gf_monthly2[gf_monthly2['person'] == 'me'].mean()[0], 2))  + " minutes.")

print("Gf's average reply time since 2015 between 6am and 10pm: " +
      str(round(gf_monthly2[gf_monthly2['person'] == 'gf'].mean()[0], 2)) + " minutes.")

```

    My average reply time since 2015 between 6am and 10pm: 42.28 minutes.
    Gf's average reply time since 2015 between 6am and 10pm: 53.08 minutes.



![png](output_32_1.png)


Filtering out the nights, and removing overnight replies certainly changed the structure of the data. The overall averages suggest only a difference in reply time of about 6 minutes between gf and I. The graph also shows more clearly certain months that have greater or smaller reply times on both of our parts. Given this new graph, I'd say it's about even!


```python

```
