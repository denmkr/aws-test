import cv2
import numpy as np
import matplotlib.path as mpltPath
import math
from scipy.spatial import distance
 
class Stroke:
    # def __init__(self):

    def setCourtNetPoints(self, points):
        self.net_points = points
        return self.net_points
        
    def getStrokeSide(self, player_pos, ball_pos, right_hand):
        perpendicular = calculatePerpendicularIntersection(self.net_points, player_pos)
        sign = getPositionRelationOfPointWithLine(ball_pos, perpendicular)
        
        if right_hand: 
            if sign >= 0:
                return "backhand"
            else:
                return "forehand"
        else:
            if sign >= 0:
                return "forehand"
            else:
                return "backhand"

    def getStrokePlayer(self, player1_pos, player2_pos, ball_pos):
        p1_dist = getDistanceBetweenPoints(player1_pos, ball_pos)
        p2_dist = getDistanceBetweenPoints(player2_pos, ball_pos)

        if p1_dist <= p2_dist:
            return 'p1'
        else:
            return 'p2'
                
                
### Private methods ###
def getPositionRelationOfPointWithLine(point, line):
    return ((point[0] - line[0][0]) * (line[1][1] - line[0][1]) - (point[1] - line[0][1]) * (line[1][0] - line[0][0]))

def calculatePerpendicularIntersection(line, point):
    x1, y1 = line[0]
    x2, y2 = line[1]
    x, y = point

    dx = x2-x1
    dy = y2-y1
    
    dt = dx*dx + dy*dy
    a = (dy * (y-y1) + dx * (x-x1)) / dt

    return np.array([point, [x1+a*dx, y1+a*dy]])

def getDistanceBetweenPoints(point1, point2):
    return distance.euclidean(point1, point2)