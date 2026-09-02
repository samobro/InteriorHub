using System.Text.Json;
using System.Text.Json.Nodes;
namespace ISD.Audit.Infrastructure.Sanitization;

public static class PiiSanitizer 
{

    private const string MaskedValue = "***MASKED***";
    private static readonly string[] SensitiveKeywords = { "password", "pwd", "pin", "otp", "cvv", "secret", "token", "ssn" };

    public static string? Sanitize(string? metadataJson) 
    { 
        if (string.IsNullOrWhiteSpace(metadataJson)) 
            return metadataJson; 
        
        try
        {
            var node = JsonNode.Parse(metadataJson);
            
            if (node is JsonObject jsonObject) 
            {
                SanitizeObject(jsonObject);
            } 
            return node?.ToJsonString();
        } 
        
        catch (JsonException) 
        { 
            return MaskedValue;
        } 
    } 
    
    private static void SanitizeObject(JsonObject jsonObject)
    {
        var keys = jsonObject.Select(kv => kv.Key).ToList(); 

        foreach (var key in keys) 
        { 
            if (IsSensitiveKey(key)) 
            {
                jsonObject[key] = MaskedValue; continue; 
            } 

            if (jsonObject[key] is JsonObject nestedObject) 
            { 
                SanitizeObject(nestedObject);
            }
        }
    } 
    
    private static bool IsSensitiveKey(string key) 
    {
        return SensitiveKeywords.Any(keyword => key.Contains(keyword, StringComparison.OrdinalIgnoreCase)); 
    } 
}