import pandas as pd
from meta import clean_ta

# Load the excel data:
TA = pd.read_excel('data/meta/Transit_Agencies_for_Visualization.xlsx',
                   sheet_name='TC AgencyList')
NTD22_RAW = pd.read_excel('data/ntd/TS2.2TimeSeriesSysWideOpexpSvc_2.xlsx',
                          sheet_name=['UPT', 'VRM', 'FARES', 'VRH', 'Total OE',
                                      'DRM', 'VOMS', 'PMT'])
NTD21_RAW = pd.read_excel('data/ntd/TS2.1TimeSeriesOpExpSvcModeTOS_3.xlsx',
                          sheet_name='UPT')

print 'Data successfully loaded from Excel'

ntd21 = {}
ntd22 = {}

NTD21_RAW = NTD21_RAW.dropna(subset=['NTD ID'])
for i in NTD22_RAW:
    ntd22[i] = NTD22_RAW[i].dropna(subset=['NTD ID'])

def filterByMode(dframe, modes):
    return dframe[dframe['Mode'].isin(modes)]

# Filter bus data by required modes
BUS_MODES = ['MB', 'RB', 'CB', 'TB']
ntd21['bus'] = filterByMode(NTD21_RAW, BUS_MODES)

RAIL_MODES = ['CC', 'CR', 'HR', 'LR', 'MG', 'SR', 'YR']
ntd21['rail'] = filterByMode(NTD21_RAW, RAIL_MODES)

# Drop unused columns
col22 = ['Last Report Year', 'Legacy NTD ID', 'Agency Name', 'Agency Status',
         'Reporter Type', 'City', 'State', 'Census Year', 'Primary UZA Name',
         'UZA', 'UZA Area SQ Miles', 'UZA Population', '2017 Status']
col21 = ['Last Report Year', 'Legacy NTD ID', 'Agency Name', 'Agency Status',
         'Reporter Type', 'City', 'State', 'Census Year', 'UZA Name', 'Mode', 'Service',
         'Mode Status', 'UZA', 'UZA Area SQ Miles', 'UZA Population', '2017 Status']

TA_DROP = ['ShowIndividual', '"Other" primary Project ID', 'Primary UZA',
           'UZA Name', 'Agency Name', 'Reporter Acronym']
ta_clean = clean_ta(TA, TA_DROP)

datasets = {}

for i in ntd21:
    datasets[i] = ntd21[i].drop(columns=col21)

for i in ntd22:
    datasets[i] = ntd22[i].drop(columns=col22)

print 'Loaded and cleaned data for: ' + str(datasets.keys())

# Merge the data with TA metadata
def ntd_merge(dframe, d_name):
    # Merge dataframes
    merge = pd.merge(ta_clean, dframe, how='left', on='NTD ID')
    group = merge.drop(columns=['NTD ID']).groupby('Project ID')

    # Sum, stack, and export to CSV
    s_t = group.sum().stack()
    return s_t.rename(d_name)

stacks = {}

for name, df in datasets.items():
    n = name.replace(' ', '_').lower()
    stack = ntd_merge(df, n)
    years = pd.Series(stack.index.levels[1])
    stacks[n] = stack.drop(years[years.astype(int) <= 2005], level=1)
    print stacks[n]

print'Created stacks for ' + str(stacks.keys())

# Calculate derived values
# Average fares
stacks['fares'] = pd.Series(stacks['fares'] / stacks['upt'], name='fares')

# Average speed
stacks['speed'] = pd.Series(stacks['vrm'] / stacks['vrh'], name='speed')

# Farebox recovery
stacks['recovery'] = pd.Series(stacks['fares'] / stacks['total_oe'], name='recovery')

# Vehicle revenue miles per ride
stacks['vrm_per_ride'] = pd.Series(stacks['vrm'] / stacks['upt'], name='vrm_per_ride')

# Average headways
stacks['headways'] = pd.Series((stacks['drm'] / stacks['speed']) / stacks['voms'], name='headways')

# Average trip length
stacks['trip_length'] = pd.Series(stacks['pmt'] / stacks['upt'], name='trip_length')

# Delete extra indicators
del stacks['fares']
del stacks['vrh']
del stacks['drm']
del stacks['voms']
del stacks['pmt']

print 'Calculated values for ' + str(stacks.keys())

# Export to CSV
pd.concat(stacks.values(), axis=1).to_csv('data/output/ntd.csv', index_label=['id', 'year'])
