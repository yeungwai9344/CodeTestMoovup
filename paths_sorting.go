package main

import (
	"fmt"
	"slices"
)

// This sample is the formated version of below diagram:
// https://github.com/moovup/programming-test/blob/master/assets/web/graph.png
// Key: Node
// Value: Array of nodes it connected, every nodes -
//   - should not contain itself
//   - should not contain duplicated nodes connection
//   - should have its counterpart connection on the another side's node
var sample = map[string][]string{
	"A": []string{"B", "D", "H"},
	"B": []string{"A", "C", "D"},
	"C": []string{"B", "D", "F"},
	"D": []string{"A", "B", "C", "E"},
	"E": []string{"D", "F", "H"},
	"F": []string{"C", "E", "G"},
	"G": []string{"F", "H"},
	"H": []string{"A", "E", "G"},
}

// Input variables
var input = sample
var start = "A"
var dest = "H"

func main() {

	log("--- Input Check ---")
	if CheckDataValid(input) {
		log("Checked OK")
	} else {
		return
	}
	log("")
	log("")

	log("--- Shortest Path ---")
	resultShortest := ShortestPaths(input, start, dest)
	if resultShortest != nil {
		log("Path Shortest: %+v", resultShortest)
	} else {
		log("No path is found")
	}
	log("")
	log("")

	log("--- All Paths ---")
	result := AllPaths(input, start, dest)
	if len(result) > 0 {
		for i := 0; i < len(result); i++ {
			log("Path %d: %+v", i+1, result[i])
		}
	} else {
		log("No path is found")
	}
}

// global cache of input
var allNodes map[string][]string = nil

// Return all paths from input. Input is supposed to be checked
func AllPaths(input map[string][]string, start string, dest string) [][]string {
	if input[start] == nil || input[dest] == nil {
		log("ERR: start / dest node not exist")
		return nil
	}

	// init
	allNodes = input
	startPath := []string{start}
	return AllPathsInner(start, dest, startPath)
}

// Wrapped recursive working function
func AllPathsInner(start string, dest string, currentPath []string) [][]string {
	// work in binary tree waterfall style
	// scanning all connected nodes in current node, and doing the same to connected nodes

	result := [][]string{}
	for _, node := range allNodes[start] {
		// used node are skipped
		if slices.Contains(currentPath, node) {
			continue
		}

		// append the node to current path
		// WARN: DEEP CLONE please
		subPath := []string{}
		subPath = append(subPath, currentPath...)
		subPath = append(subPath, node)

		if node == dest {
			// destination found. append to result
			result = append(result, subPath)
		} else {
			// not yet. repeat in this node and check if any subsequencial paths
			subResult := AllPathsInner(node, dest, subPath)
			if len(subResult) > 0 {
				result = append(result, subResult...)
			}
		}
	}
	// all nodes fetched
	return result
}

// Return the shortest paths from input. Input is supposed to be checked
func ShortestPaths(nodes map[string][]string, start string, dest string) []string {
	if nodes[start] == nil || nodes[dest] == nil {
		log("ERR: start / dest node not exist")
		return nil
	}

	// init
	allNodes = nodes
	startPath := []string{start}

	// working with depth of nodes scanning
	// incrementing depth until any path is found
	for i := 1; i <= len(nodes); i++ {
		if result := ShortestPathsInner(start, dest, startPath, i); result != nil {
			return result
		}
	}
	return nil
}

// Wrapped recursive working function
func ShortestPathsInner(start string, dest string, currentPath []string, depth int) []string {
	// we recursing it until depth=0 or path is found

	if depth == 0 {
		return nil
	}

	for _, node := range allNodes[start] {
		subPath := []string{}
		subPath = append(subPath, currentPath...)
		subPath = append(subPath, node)

		if node == dest {
			// destination found. return it as result
			return subPath
		}

		// not yet. go deeper
		if result := ShortestPathsInner(node, dest, subPath, depth-1); result != nil {
			return result
		}
	}
	return nil
}

func CheckDataValid(allPaths map[string][]string) bool {
	if allPaths == nil {
		log("ERR: Input cannot be nil")
		return false
	}

	// cross check: for shooting the duplicate.
	// find out the AB + BA pair, remove if found.
	// suppose resulting an empty map if all are in pairs without problem
	mapCrosscheck := map[string]bool{}
	for key, array := range allPaths {
		if len(key) > 1 {
			log("ERR: Key %s: Key name cannot have length>1", key)
			return false
		}
		if len(array) == 0 {
			log("ERR: Key %s: Cannot be empty", key)
			return false
		}
		for _, node := range array {
			if node == key {
				log("ERR: Key %s: Cannot connect to itself", key)
				return false
			}
			if len(node) > 1 {
				log("ERR: Key %s: Node name cannot have length>1: %s", key, node)
				return false
			}

			crosscheckAB := fmt.Sprintf("%s%s", key, node)
			crosscheckBA := fmt.Sprintf("%s%s", node, key)
			if _, ok := mapCrosscheck[crosscheckAB]; ok {
				log("ERR: Key %s: Node cannot be duplicated: %s", key, node)
				return false
			} else if _, ok := mapCrosscheck[crosscheckBA]; ok {
				delete(mapCrosscheck, crosscheckBA)
			} else {
				mapCrosscheck[crosscheckAB] = true
			}
		}
	}
	if len(mapCrosscheck) > 0 {
		log("ERR: Node redundent:")
		for key, _ := range mapCrosscheck {
			log(key)
		}
		return false
	}
	return true
}

func log(format string, args ...interface{}) {
	fmt.Printf(format, args...)
	fmt.Printf("\n")
}
