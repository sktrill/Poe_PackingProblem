# Poe_PackingProblem

Play with the app here: https://sk-poe-packingproblem.herokuapp.com/

<p><b>Problem</b></p>
Pack a set of unequal circles (based on word length) into a rectangular container, such that all circles are tangent to each other.

<p><b>Solution</b></p>
The packing problem is a class of optimization problems that involves finding the maximal density that a set of objects can be placed into a container. Different versions of this problem also go by the knapsack problem or the covering problem.

The constraints of the problem can be stated as:
<ol type="I">
  <li>Unequal circles placed in the container should not extend outside the container</li>
  <li>Unequal circles cannot overlap each other</li>
  <li>Retain the structure of the poem, where possible</li>
</ol>

The solution looks to find the placement options for each circle that satisfy the above constraint and reduce the distance of the circle being added from the ones already placed in the container. A hole degree, lambda, is determined by calculating the distance of the new circle from all other placed circles and the sides of the rectangle.

The optimization rule looks to find the placement option with the maximum hole degree, lambda, for each circle. For more details please see the discussion of the solution in the app link above. 

@thekotecha
