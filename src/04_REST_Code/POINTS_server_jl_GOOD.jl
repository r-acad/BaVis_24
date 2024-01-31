using HTTP

function read_file_to_string(file_path)
    try
        # Open the file, read its contents, and convert to a string
        return read(file_path, String)
    catch e
        # If an error occurs (e.g., if the file does not exist), print the error message
        println("Error reading file: $e")
        return nothing
    end
end

# Usage example
#file_contents = read_file_to_string("path/to/your/file.txt")

file_contents = read_file_to_string("mandelbrot_zoom2")


# If the file was read successfully, print its contents
if file_contents !== nothing
    println("File Contents:\n", file_contents)
end

#=
#*************************************
using JSON

# Create a list of planets and their diameters
planets_data = Dict(
    "Mercury" => 4879,
    "Venus" => 12104,
    "Earth" => 12742,
    "Mars" => 6779,
    "Jupiter" => 139820,
    "Saturn" => 116460,
    "Uranus" => 50724,
    "Neptune" => 49244
)

# Convert the data to JSON format
json_data = JSON.json(planets_data)

# Convert the JSON data to a pure string
json_string = String(json_data)

# Print the JSON string
println("JSON String:")
println(json_string)
#********************************************************
=#


json_data = """{"P1": {"x": 11, "y": 2, "z": 3}, "P2": {"x": 4, "y": 15, "z": 6}, "P3": {"x": 7, "y": 8, "z": 19}, "P4": {"x": 10, "y": 11, "z": 12}}"""


const ROUTER = HTTP.Router()

function square(req::HTTP.Request)
    headers = [
        "Access-Control-Allow-Origin" => "*",
        "Access-Control-Allow-Methods" => "POST, OPTIONS"
    ]
    # handle CORS requests
    if HTTP.method(req) == "OPTIONS"
        return HTTP.Response(200, headers)
    end
    #body = parse(Float64, String(req.body))
    #square = body^2
    #HTTP.Response(200, headers, parse(String, String(req.body)))

    HTTP.Response(200, headers, json_data)

end

HTTP.register!(ROUTER, "POST", "/api/square", square)

server = HTTP.serve!(ROUTER, "127.0.0.1", 8080)





