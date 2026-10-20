using System.ComponentModel.DataAnnotations;

namespace WalletApi.Dtos
{
    public class LoginResponse
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Message { get; set; }
        public string Token { get; set; } = string.Empty;
        public string expiresAt { get; set; } = string.Empty;
        public IList<string> Roles { get; set; } = new List<string>();
    }
}