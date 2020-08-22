from collections import defaultdict
import json

g_stations = ["BENDIGO","KangarooFlat","Castlemaine","Malmsbury","Kyneton","Woodend","Macedon","Gisborne","RiddellsCreek","Clarkefield","Sunbury","Watergardens","Footscray","SOUTHERNCROSSSTATION"]
g_stationsNice = ["Bendigo","Kangaroo Flat","Castlemaine","Malmsbury","Kyneton","Woodend","Macedon","Gisborne","Riddells Creek","Clarkefield","Sunbury","Watergardens","Footscray","Southern Cross"]
g_distances = [164.24,159.35,127.28,104.16,93.55,80.08,71.78,66.21,58.90,50.42,39.5,24.3,4.9,0]

g_minTime = 1440;
g_maxTime = 0;

g_services = defaultdict(dict)

def IsStation(name):
    return name in g_stations;

def GetStationIndex(name):
    for i in range(len(g_stations)):
        if(g_stations[i]==name):
            return i;
    return -1;

def ProcessTime(timeString):
    if '-' in timeString:
        return timeString
    tokens = timeString.split('.')
    h = int(tokens[0])
    m = int(tokens[1])
    totalMin = h * 60 + m

    #wrap hack
    if totalMin < 180:
        totalMin += 1440

    global g_minTime,g_maxTime
    g_minTime = min(g_minTime,totalMin)
    g_maxTime = max(g_maxTime,totalMin)

    return totalMin

with open("ref/300-U-D-WBLOB-Bendigo-57.txt", 'r') as fin:
    lines = fin.readlines()

completedServices = 0
servicesInBlock = 0
#stopCounter = 0

for line in lines:
    tokens = line.split()
    #print(tokens)
    #print(len(tokens))

    if len(tokens) > 0:
        if tokens[0] == "Service":
            completedServices += servicesInBlock
            servicesInBlock = len(tokens) - 1
            stopCounter = 0
        elif IsStation(tokens[0]):
            if len(tokens) - 1 != servicesInBlock:
                print("Unexpected number of tokens:" + str(len(tokens)-1) + " vs " + str(servicesInBlock) + str(tokens))
            else:
                #if stopCounter == 0:
                stationIndex = GetStationIndex(tokens[0])
                for i in range(servicesInBlock):
                    g_services[completedServices + i][stationIndex] = ProcessTime(tokens[i+1].replace('d','').replace('u',''))

                print(tokens[0] + ":" + str(len(tokens)))
        else:
            print("Unknown token:" + tokens[0])

outputDict = {"services":g_services,"stations":g_stationsNice,"distances":g_distances,"minTime":g_minTime,"maxTime":g_maxTime}
with open("processed.json", 'w') as f:
    json.dump(outputDict, f, indent = 2, separators=(',', ': '))
