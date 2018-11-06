import re
import pandas as pd
import geopandas as gpd

def clean_ta(ta, drop):
    # Remove missing NTD ID's
    ta = ta.dropna(how='all')

    # Combine project ID's
    ta['Project ID'] = ta['Project ID'].combine_first(
        ta['"Other" primary Project ID']
    ).astype('int32')
    ta['Agency Name'] = ta['Agency Name'].combine_first(
        ta['Reporter Acronym']
    )

    # Drop unused columns
    return ta.drop(columns=drop)

def make_match_name(name):
    matches = re.search(r"(\s|\w)*", name)
    return matches.group(0)

def load_csa():
    csa = gpd.read_file('data/geojson/cbsa/cb_2017_us_cbsa_500k.shp')
    csa['centx'] = csa.centroid.x
    csa['centy'] = csa.centroid.y
    csa['name_match'] = csa['NAME'].apply(make_match_name)
    merge = pd.merge(csa, csa.bounds, how='inner', left_index=True, right_index=True)
    return merge.drop(columns=['CSAFP', 'CBSAFP', 'AFFGEOID', 'LSAD',
                               'ALAND', 'AWATER', 'geometry'])

def main():
    # Load the excel data:
    TA = pd.read_excel('data/meta/Transit_Agencies_for_Visualization.xlsx',
                       sheet_name='TC AgencyList')

    print 'Data successfully loaded from Excel'

    DROP = ['ShowIndividual', '"Other" primary Project ID', 'Primary UZA']
    agencies = clean_ta(TA, DROP)
    agencies['name_match'] = agencies['UZA Name'].apply(make_match_name)

    csa = load_csa()
    merge = pd.merge(agencies, csa, how='inner', on='name_match')

    # Export TA metadata
    merge[['Project ID', 'Agency Name', 'Reporter Acronym', 'GEOID']].to_csv(
        'data/output/ta.csv', index=False,
        header=['taid', 'taname', 'tashort', 'msaid'])

    # Export MSA metadata
    geo = merge[['GEOID', 'NAME', 'centx', 'centy', 'minx', 'miny', 'maxx', 'maxy']]
    geo = geo.groupby('GEOID').first()
    geo.to_csv('data/output/msa.csv', index_label='msaid',
               header=['name', 'centx', 'centy', 'minx', 'miny', 'maxx', 'maxy'])

if __name__ == "__main__":
    main()
