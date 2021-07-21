import cv2
import numpy as np
import matplotlib.path as mpltPath
import math
from scipy.spatial import distance

class Homography:
    def __init__(self):
        self.initTargetPoints()

    def initTargetPoints(self):
        target_points = np.array([[0, 0], [4.5, 0], [18, 0], [31.5, 0], [36, 0],
            [0, 18], [4.5, 18], [18, 18], [31.5, 18], [36, 18],
            [0, 39], [4.5, 39], [18, 39], [31.5, 39], [36, 39],
            [0, 60], [4.5, 60], [18, 60], [31.5, 60], [36, 60],
            [0, 78], [4.5, 78], [18, 78], [31.5, 78], [36, 78]])

        target_points = target_points - [4.5, 0]

        self.target_sectors = calculateSectors(target_points)
    
    def setSourcePoints(self, points):
        source_points = points.tolist()

        pairs = [[[1,2], [5,9]], [[0,7], [4,5]], [[3,11], [5,6]], [[7,15], [12,13]], [[11,18], [13,14]], [[16,17], [9,13]]]
        indeces = [2, 5, 9, 15, 19, 22]

        for i, pair in enumerate(pairs):
            line1_i, line2_i = pair

            line1 = [points[line1_i[0]], points[line1_i[1]]]
            line2 = [points[line2_i[0]], points[line2_i[1]]]
            point = lines_intersection(line1, line2)

            source_points.insert(indeces[i], point)

        self.source_sectors = calculateSectors(source_points)
        return np.array(source_points)

    def transformPoint(self, point):
        target_point = getTranslatedPoint(point, self.source_sectors, self.target_sectors)

        return target_point


### Private methods ###
def getTransformedPoint(point, h):
    x, y = point
    
    A = np.array([[[x, y]]], dtype = np.float32)
    result = cv2.perspectiveTransform(A, h)[0][0]
    
    return np.around(result, 0)

def calculateSectors(points): # 1, 2, 3, 4, 5 , ...
    sectors = []
    
    num_of_sectors = 16
    sectors_per_row = 4 # as we have 4 sectors per row
    
    for i in range(num_of_sectors):
        row = i // sectors_per_row
        sector = [points[i + row], points[i + 1 + row], points[i + 1 + row + 5], points[i + row + 5]]
    
        sectors.append(np.array(sector))
    
    return sectors

def getTranslatedPoint(point, source_sectors, target_sectors):
    for i, source_sector in enumerate(source_sectors):
        path = mpltPath.Path(source_sector)
        is_inside = path.contains_point(point)

        if is_inside:
            target_sector = target_sectors[i]
            h, status = cv2.findHomography(source_sector, target_sector, cv2.RANSAC)
            
            return getTransformedPoint(point, h)
    
    # If no sector contains (outside all sectors) -> find most appropriate sector to use
    candidate_sectors, candidate_sectors_i = findSectorCandidates(point, source_sectors)
    
    # Only one sector candidate exists
    if len(candidate_sectors) == 1:
        h, status = cv2.findHomography(candidate_sectors[0], target_sectors[candidate_sectors_i[0]], cv2.RANSAC)    
        return getTransformedPoint(point, h)
    
    # Two sector candidates exist
    sector, sector_i = chooseSectorCandidate(point, candidate_sectors, candidate_sectors_i)
    
    h, status = cv2.findHomography(sector, target_sectors[sector_i], cv2.RANSAC) 
    return getTransformedPoint(point, h)

def findSectorCandidates(point, sectors):
    min_dist = math.inf
    min_sector1_i = None
    min_sector2_i = None
    
    for i, sector in enumerate(sectors):
        for sector_point in sector:
            dist = getDistanceBetweenPoints(point, sector_point)
            if dist == min_dist:
                min_sector2_i = i
                
            if dist < min_dist:
                min_dist = dist
                min_sector1_i = i
                min_sector2_i = None
    
    if min_sector2_i is None:
        return [[sectors[min_sector1_i]], [min_sector1_i]]
    else:
        return [[sectors[min_sector1_i], sectors[min_sector2_i]], [min_sector1_i, min_sector2_i]]

def chooseSectorCandidate(point, sectors, sectors_i):
    sector1 = sectors[0]
    sector2 = sectors[1]
    sector1_i = sectors_i[0]
    sector2_i = sectors_i[1]
    
    shared_line = []
    unique_point = None
    
    for candidate_point in sector1:
        if candidate_point in sector2: # Sectors share the point
            shared_line.append(candidate_point)
        else: 
            if unique_point is None: # Take only once
                unique_point = candidate_point

    # Only one point is shared (not line)
    # Incorrect tennis court form
    if len(shared_line) == 1:
        return [sector1, sector1_i]
            
    pointLineRelation = getPositionRelationOfPointWithLine(point, shared_line)
    candidate1LineRelation = getPositionRelationOfPointWithLine(unique_point, shared_line)
    
    # If the sign of candidate1 matches the sign of the point -> Use candidate1 sector
    # Else -> Use candidate2 sector
    if haveEqualSign(pointLineRelation, candidate1LineRelation):
        return [sector1, sector1_i]
    
    return [sector2, sector2_i]


### Auxilary functions
def haveEqualSign(a, b):
    abs(a + b) == abs(a) + abs(b)

def getDistanceBetweenPoints(point1, point2):
    return distance.euclidean(point1, point2)

def getPositionRelationOfPointWithLine(point, line):
    return ((point[0] - line[0][0]) * (line[1][1] - line[0][1]) - (point[1] - line[0][1]) * (line[1][0] - line[0][0]))

def line_coefs(line):
    p1, p2 = line

    A = (p1[1] - p2[1])
    B = (p2[0] - p1[0])
    C = (p1[0] * p2[1] - p2[0] * p1[1])

    return A, B, -C

def lines_intersection(line1, line2):
    L1 = line_coefs(line1)
    L2 = line_coefs(line2)

    D = L1[0] * L2[1] - L1[1] * L2[0]
    Dx = L1[2] * L2[1] - L1[1] * L2[2]
    Dy = L1[0] * L2[2] - L1[2] * L2[0]

    if D != 0:
        x = Dx / D
        y = Dy / D
        return round(x, 0), round(y, 0)
    else: # Parallel
        return False