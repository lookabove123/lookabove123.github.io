from PIL import Image
import numpy as np

sz = 10
arr = [[0 for i in range(sz)] for j in range(sz)]
vis = [[0 for i in range(sz)] for j in range(sz)]

rad = 2
x = [-1, 1, 0, 0]
y = [0, 0, -1, 1]
for i in range(sz):
    for j in range(sz):
        q = [(i, j, 0)]
        while (len(q)>0):
            curr = q[0]
            print(len(q), curr[0])
            leng = curr[2]
            q = q[1:]
            if (leng>rad or vis[i][j]):
                continue
            i = curr[0]
            j = curr[1]
            vis[i][j] = 1
            arr[i][i] = 1
            for s in range(4):
                ii = i+x[s]
                jj = j+y[s]
                if ii<0 or ii>=sz or jj<0 or jj>=sz:
                    continue
                q.append((i+x[s], j+y[s], leng+1))

for j in arr:
    print(j)

# img = Image.fromarray(arr)
# img.save("test.png")