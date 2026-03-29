using System.Text.RegularExpressions;

namespace Monitori.Api.Services;

/// <summary>
/// Serviço utilitário para validação de CNPJ.
/// Implementa algoritmo de dígitos verificadores conforme Receita Federal.
/// </summary>
public static class CnpjValidator
{
    /// <summary>
    /// Valida um CNPJ verificando formato e dígitos verificadores.
    /// </summary>
    /// <param name="cnpj">CNPJ com ou sem formatação</param>
    /// <returns>True se válido, False se inválido</returns>
    public static bool IsValid(string cnpj)
    {
        if (string.IsNullOrWhiteSpace(cnpj))
            return false;

        // Remove formatação
        cnpj = Regex.Replace(cnpj, @"[^0-9]", "");

        // Deve ter 14 dígitos
        if (cnpj.Length != 14)
            return false;

        // Verifica se todos os dígitos são iguais (ex: 00000000000000)
        if (cnpj.All(c => c == cnpj[0]))
            return false;

        // Valida primeiro dígito verificador
        var multiplicadores1 = new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        var soma1 = 0;
        for (int i = 0; i < 12; i++)
            soma1 += (cnpj[i] - '0') * multiplicadores1[i];

        var resto1 = soma1 % 11;
        var digito1 = resto1 < 2 ? 0 : 11 - resto1;

        if (cnpj[12] - '0' != digito1)
            return false;

        // Valida segundo dígito verificador
        var multiplicadores2 = new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        var soma2 = 0;
        for (int i = 0; i < 13; i++)
            soma2 += (cnpj[i] - '0') * multiplicadores2[i];

        var resto2 = soma2 % 11;
        var digito2 = resto2 < 2 ? 0 : 11 - resto2;

        return cnpj[13] - '0' == digito2;
    }

    /// <summary>
    /// Remove formatação do CNPJ, deixando apenas números.
    /// </summary>
    public static string Sanitize(string cnpj)
    {
        if (string.IsNullOrWhiteSpace(cnpj))
            return string.Empty;
        return Regex.Replace(cnpj, @"[^0-9]", "");
    }

    /// <summary>
    /// Formata CNPJ no padrão XX.XXX.XXX/XXXX-XX
    /// </summary>
    public static string Format(string cnpj)
    {
        var numeros = Sanitize(cnpj);
        if (numeros.Length != 14)
            return cnpj;

        return $"{numeros[..2]}.{numeros[2..5]}.{numeros[5..8]}/{numeros[8..12]}-{numeros[12..]}";
    }
}
