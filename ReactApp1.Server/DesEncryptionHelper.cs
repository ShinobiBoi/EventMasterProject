using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

public static class DesEncryptionHelper
{
    private static readonly string keyString = "8bytekey"; // Must be 8 characters
    private static readonly byte[] key = Encoding.UTF8.GetBytes(keyString);
    private static readonly byte[] iv = Encoding.UTF8.GetBytes("8byteiv_"); // Must also be 8 characters

    public static string Encrypt(string plainText)
    {
        using (DES des = DES.Create())
        {
            des.Key = key;
            des.IV = iv;

            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            using var ms = new MemoryStream();
            using var cs = new CryptoStream(ms, des.CreateEncryptor(), CryptoStreamMode.Write);
            cs.Write(plainBytes, 0, plainBytes.Length);
            cs.FlushFinalBlock();

            return Convert.ToBase64String(ms.ToArray());
        }
    }

    public static string Decrypt(string cipherText)
    {
        using (DES des = DES.Create())
        {
            des.Key = key;
            des.IV = iv;

            byte[] cipherBytes = Convert.FromBase64String(cipherText);
            using var ms = new MemoryStream();
            using var cs = new CryptoStream(ms, des.CreateDecryptor(), CryptoStreamMode.Write);
            cs.Write(cipherBytes, 0, cipherBytes.Length);
            cs.FlushFinalBlock();

            return Encoding.UTF8.GetString(ms.ToArray());
        }
    }
}
